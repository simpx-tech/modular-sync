// TODO unify imports
import {beforeEach, expect} from "@jest/globals";
import {setupTests} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {DatabaseMerger} from "../sync-database-merger";
import {setupRepositories} from "@simpx/sync-core/__tests__/helpers/setup-repositories";
import {setupDomains} from "@simpx/sync-core/__tests__/helpers/setup-domains";
import {setupAuthentication} from "@simpx/sync-core/__tests__/helpers/setup-authentication";
import {PushOperationBuilder} from "@simpx/sync-core/src/helpers/push-operation-builder";
import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {v4} from "uuid";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";

describe('DeleteEntityStrategy', () => {
  let syncEngine: ServerSyncEngine;
  let simpleRepository: RepositoryBase<any, any, any, any>;
  let mergeEngine: DatabaseMerger;

  beforeEach(async () => {
    ({ syncEngine, simpleRepository } = setupTests());

    await syncEngine.runSetup();
    await setupAuthentication(syncEngine);
    await setupRepositories(syncEngine);
    await setupDomains(syncEngine);

    mergeEngine = syncEngine.domains.find(domain => domain.name === "test-domain").mergeEngine as DatabaseMerger;
  });

  it("should fail if the entity doesn't exists", async () => {
    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.DeleteEntity,
      creationUUID: v4(),
      uuid: v4(),
      changedAt: new Date(),
      data: null,
    }).build();

    await expect(mergeEngine.deleteEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp)).rejects.toEqual(new InternalServerErrorException("Trying to delete an entity that does not exist"));
  });

  it('should delete the correct entity', async () => {
    const entity1 = {
      test: "test",
      test2: "test2",
      creationUUID: "test",
      changedAt: new Date(),
      createdAt: new Date(),
      submittedAt: new Date(),
      repository: 1,
      domain: 1,
      wasDeleted: false,
      deletedAt: null,
    }

    const entity2 = {
      test: "test3",
      test2: "test4",
      creationUUID: "test2",
      changedAt: new Date(),
      createdAt: new Date(),
      submittedAt: new Date(),
      repository: 1,
      domain: 1,
      wasDeleted: false,
      deletedAt: null,
    }

    await simpleRepository.create(entity1);
    await simpleRepository.create(entity2);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.DeleteEntity,
      creationUUID: entity2.creationUUID,
      uuid: entity2.creationUUID,
      changedAt: new Date(),
      data: null,
    }).build();

    console.log()

    await mergeEngine.deleteEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const entities = await simpleRepository.getAll();

    expect(entities).toEqual([
      {
        id: 1,
        ...entity1,
      },
      {
        id: 2,
        ...entity2,
        wasDeleted: true,
        changedAt: pushOp.modifications[0].changedAt,
        deletedAt: pushOp.modifications[0].changedAt,
        submittedAt: pushOp.submittedAt,
      }
    ]);

    const modifications = await mergeEngine.modificationRepository.getAll();

    expect(modifications).toEqual([
      {
        id: 1,
        entity: "test_entity",
        creationUUID: entity2.creationUUID,
        uuid: entity2.creationUUID,
        changedAt: pushOp.modifications[0].changedAt,
        data: null,
        repository: 1,
        domain: 1,
        operation: EntityModificationType.DeleteEntity,
        submittedAt: pushOp.submittedAt,
      }
    ]);
  });

  it('should not run again if already run', async () => {
    const modification = {
      entity: "test_entity",
      creationUUID: "test",
      uuid: "test",
      changedAt: new Date(),
      data: null,
      repository: 1,
      domain: 1,
      operation: EntityModificationType.DeleteEntity,
      submittedAt: new Date()
    }

    await mergeEngine.modificationRepository.create(modification);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.DeleteEntity,
      creationUUID: "test",
      uuid: v4(),
      changedAt: new Date(),
      data: null,
    }).build();

    const spy = jest.spyOn(simpleRepository, "updateByField");

    await mergeEngine.deleteEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    expect(spy).not.toHaveBeenCalled();

    const modifications = await mergeEngine.modificationRepository.getAll();
    expect(modifications).toEqual([
      {
        id: 1,
        ...modification,
      }
    ]);
  });

  it('should allow delete twice without problem (has run soft delete but not registered modification)', async () => {
    const entity1 = {
      test: "test",
      test2: "test2",
      creationUUID: "test",
      changedAt: new Date(),
      createdAt: new Date(),
      deletedAt: new Date(),
      wasDeleted: true,
      submittedAt: new Date(),
      repository: 1,
      domain: 1,
    }

    await simpleRepository.create(entity1);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.DeleteEntity,
      creationUUID: entity1.creationUUID,
      uuid: entity1.creationUUID,
      changedAt: new Date(),
      data: null,
    }).build();

    await mergeEngine.deleteEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const entities = await simpleRepository.getAll();

    expect(entities).toEqual([
      {
        id: 1,
        ...entity1,
        changedAt: pushOp.modifications[0].changedAt,
        deletedAt: pushOp.modifications[0].changedAt,
        submittedAt: pushOp.submittedAt,
      },
    ]);
  });
});