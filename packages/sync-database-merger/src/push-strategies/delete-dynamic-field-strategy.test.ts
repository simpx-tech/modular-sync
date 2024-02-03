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

describe('DeleteDynamicFieldStrategy', () => {
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
      operation: EntityModificationType.DeleteDynamicField,
      creationUUID: v4(),
      uuid: v4(),
      changedAt: new Date(),
      data: { key: "test" },
    }).build();

    await expect(mergeEngine.deleteDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp)).rejects.toEqual(new InternalServerErrorException("Trying to delete an dynamic field that does not exist"));
  });

  it('should delete the correct entity', async () => {
    const entity1 = {
      test: "test",
      test2: "test2",
      creationUUID: "test",
      changedAt: new Date(),
      createdAt: new Date(),
      submittedAt: new Date(),
      domain: 1,
      wasDeleted: false,
      deletedAt: null,
    }

    const dynamicField = {
      key: "test",
      value: "test2",
      entity: "test_entity",
      submittedAt: new Date(),
      deletedAt: null,
      createdAt: new Date(),
      changedAt: new Date(),
      creationUUID: entity1.creationUUID,
      wasDeleted: false,
    }

    await mergeEngine.dynamicFieldRepository.create(dynamicField);

    await simpleRepository.create(entity1);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      operation: EntityModificationType.DeleteDynamicField,
      creationUUID: entity1.creationUUID,
      uuid: entity1.creationUUID,
      changedAt: new Date(),
      data: { key: "test" },
    }).build();

    await mergeEngine.deleteDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const dynamicFields = await mergeEngine.dynamicFieldRepository.getAll();

    expect(dynamicFields).toEqual([
      {
        id: 1,
        ...dynamicField,
        changedAt: pushOp.modifications[0].changedAt,
        deletedAt: pushOp.modifications[0].changedAt,
        submittedAt: pushOp.submittedAt,
        wasDeleted: true,
      },
    ]);

    const modifications = await mergeEngine.modificationRepository.getAll();

    expect(modifications).toEqual([
      {
        id: 1,
        entity: "test_entity",
        creationUUID: entity1.creationUUID,
        uuid: pushOp.modifications[0].uuid,
        changedAt: pushOp.modifications[0].changedAt,
        data: {
          key: "test"
        },
        domain: 1,
        operation: EntityModificationType.DeleteDynamicField,
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
      domain: 1,
      operation: EntityModificationType.DeleteDynamicField,
      submittedAt: new Date()
    }

    await mergeEngine.modificationRepository.create(modification);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      operation: EntityModificationType.DeleteDynamicField,
      creationUUID: "test",
      uuid: v4(),
      changedAt: new Date(),
      data: null,
    }).build();

    const spy = jest.spyOn(simpleRepository, "updateByField");

    await mergeEngine.deleteDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

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
      submittedAt: new Date(),
      domain: 1,
      wasDeleted: false,
      deletedAt: null,
    }

    // TODO should mark all dynamic fields as deleted when delete entity? (maybe not necessary)
    const dynamicField = {
      key: "test",
      value: "test2",
      entity: "test_entity",
      submittedAt: new Date(),
      deletedAt: new Date(),
      createdAt: new Date(),
      changedAt: new Date(),
      creationUUID: entity1.creationUUID,
      wasDeleted: true,
    }

    await mergeEngine.dynamicFieldRepository.create(dynamicField);

    await simpleRepository.create(entity1);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      operation: EntityModificationType.DeleteDynamicField,
      creationUUID: entity1.creationUUID,
      uuid: entity1.creationUUID,
      changedAt: new Date(),
      data: { key: "test" },
    }).build();

    await mergeEngine.deleteDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const dynamicFields = await mergeEngine.dynamicFieldRepository.getAll();

    expect(dynamicFields).toEqual([
      {
        id: 1,
        ...dynamicField,
        changedAt: pushOp.modifications[0].changedAt,
        deletedAt: pushOp.modifications[0].changedAt,
        submittedAt: pushOp.submittedAt,
        wasDeleted: true,
      },
    ]);
  });
});