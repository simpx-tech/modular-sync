import {beforeEach, expect} from "@jest/globals";
import {setupTests} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {PushOperationBuilder} from "@simpx/sync-core/src/helpers/push-operation-builder";
import {DatabaseMerger} from "../sync-database-merger";
import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {v4} from "uuid";
import {setupRepositories} from "@simpx/sync-core/__tests__/helpers/setup-repositories";
import {setupDomains} from "@simpx/sync-core/__tests__/helpers/setup-domains";
import {setupAuthentication} from "@simpx/sync-core/__tests__/helpers/setup-authentication";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";

describe('UpdateEntityStrategy', () => {
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

  it('should update the correct entity', async () => {
    const entity1 = {
      test: "test",
      test2: "test2",
      creationUUID: v4(),
      changedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      submittedAt: new Date(),
      repository: 1,
      domain: 1,
    }

    const entity2 = {
      test: "test3",
      test2: "test4",
      creationUUID: v4(),
      changedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      submittedAt: new Date(),
      repository: 1,
      domain: 1,
    }

    await simpleRepository.create(entity1);
    await simpleRepository.create(entity2);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.UpdateEntity,
      creationUUID: entity2.creationUUID,
      uuid: entity2.creationUUID,
      data: {
        test: "test5",
        test2: "test6",
      },
      changedAt: new Date(),
    }).build();

    await mergeEngine.updateEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const entities = await simpleRepository.getAll();

    expect(entities).toEqual([
      {
        id: 1,
        ...entity1,
      },
      {
        id: 2,
        ...entity2,
        test: "test5",
        test2: "test6",
        submittedAt: pushOp.submittedAt,
        changedAt: pushOp.modifications[0].changedAt,
      }
    ]);
  });

  it("should fail if the entity doesn't exists", async () => {
    const uuid = v4();
    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.UpdateEntity,
      creationUUID: uuid,
      uuid: uuid,
      data: {
        test: "test5",
        test2: "test6",
      },
      changedAt: new Date(),
    }).build();

    const promise = mergeEngine.updateEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    await expect(promise).rejects.toEqual(new InternalServerErrorException("Entity not found"));
  });

  it('should ignore this modification if the modification is already on the database', async () => {
    const uuid1 = v4();

    const entity = {
      test: "test",
      test2: "test2",
      creationUUID: uuid1,
      changedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      submittedAt: new Date(),
      repository: 1,
      domain: 1,
    }

    await simpleRepository.create(entity);

    const modification = {
      entity: "test_entity",
      operation: EntityModificationType.UpdateEntity,
      data: {
        test: "test",
        test2: "test2",
      },
      entityId: 1,
      repository: 1,
      domain: 1,

      submittedAt: new Date(),
      changedAt: new Date(),
      uuid: uuid1,
    };

    await mergeEngine.modificationRepository.create(modification);

    const pushOp = new PushOperationBuilder().addModification({
      entity: modification.entity,
      type: modification.operation,
      creationUUID: modification.uuid,
      uuid: modification.uuid,
      data: modification.data,
      changedAt: modification.changedAt,
    }).build();

    const spy = jest.spyOn(simpleRepository, "upsert");

    await mergeEngine.updateEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    expect(spy).not.toHaveBeenCalled();

    const entities = await simpleRepository.getAll();

    expect(entities).toEqual([
      {
        id: 1,
        ...entity,
      }
    ]);

    const modifications = await mergeEngine.modificationRepository.getAll();
    expect(modifications).toEqual([
      {
        id: 1,
        ...modification,
      }
    ]);
  });

  it('should save the modification on the database', async () => {
    const uuid1 = v4();

    const entity = {
      test: "test",
      test2: "test2",
      creationUUID: uuid1,
      changedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      submittedAt: new Date(),
      repository: 1,
      domain: 1,
    }

    await simpleRepository.create(entity);

    const modificationUuid = v4();

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.UpdateEntity,
      creationUUID: uuid1,
      uuid: modificationUuid,
      data: {
        test: "test5",
        test2: "test6",
      },
      changedAt: new Date(),
    }).build();

    const spy = jest.spyOn(simpleRepository, "updateByField");

    await mergeEngine.updateEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    expect(spy).toHaveBeenCalled();

    const entities = await simpleRepository.getAll();

    expect(entities).toEqual([
      {
        id: 1,
        test: "test5",
        test2: "test6",
        creationUUID: uuid1,
        changedAt: expect.any(Date),
        createdAt: expect.any(Date),
        deletedAt: null,
        submittedAt: expect.any(Date),
        repository: 1,
        domain: 1,
      }
    ]);

    const modifications = await mergeEngine.modificationRepository.getAll();
    expect(modifications).toEqual([
      {
        id: 1,
        entity: "test_entity",
        operation: EntityModificationType.UpdateEntity,
        data: {
          test: "test5",
          test2: "test6",
        },
        entityId: 1,
        repository: 1,
        domain: 1,
        submittedAt: expect.any(Date),
        changedAt: expect.any(Date),
        uuid: modificationUuid,
      }
    ]);
  });
});