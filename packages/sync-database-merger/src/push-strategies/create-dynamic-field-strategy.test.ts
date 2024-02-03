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

describe('CreateDynamicFieldStrategy', () => {
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

  it('should not insert modification again if it already run', async () => {
    const modification = {
      entity: "test_entity",
      operation: EntityModificationType.CreateDynamicField,
      domain: 1,
      submittedAt: new Date(),
      creationUUID: v4(),
      uuid: v4(),
      data: {
        test: "test",
        test2: "test2",
      },
      changedAt: new Date(),
    };

    await mergeEngine.modificationRepository.create(modification);

    const spy = jest.spyOn(mergeEngine.dynamicFieldRepository, "upsert");

    await mergeEngine.createDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, modification, new PushOperationBuilder().addModification(modification).build());

    expect(spy).not.toHaveBeenCalled();
  });

  it("should fail if the entity doesn't exists", async () => {
    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      operation: EntityModificationType.CreateDynamicField,
      creationUUID: v4(),
      uuid: v4(),
      data: {
        test: "test",
        test2: "test2",
      },
      changedAt: new Date(),
    }).build()

    const promise = mergeEngine.createDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    await expect(promise).rejects.toEqual(new InternalServerErrorException("Entity not found"));
  });

  it("should create the dynamic field if it doesn't exists", async () => {
    const entityUUID = v4();

    const entity = {
      test: "test",
      test2: "test2",
      creationUUID: entityUUID,
      changedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      submittedAt: new Date(),
      domain: 1,
    }

    await simpleRepository.create(entity);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      operation: EntityModificationType.CreateDynamicField,
      creationUUID: entityUUID,
      uuid: v4(),
      data: {
        key: "test",
        value: "test2",
      },
      changedAt: new Date(),
    }).build()

    await mergeEngine.createDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const dynamicFields = await mergeEngine.dynamicFieldRepository.getAll();

    expect(dynamicFields).toEqual([
      {
        id: 1,
        key: "test",
        value: "test2",
        entity: "test_entity",
        submittedAt: pushOp.submittedAt,
        createdAt: pushOp.modifications[0].changedAt,
        changedAt: pushOp.modifications[0].changedAt,
        creationUUID: pushOp.modifications[0].creationUUID,
        wasDeleted: false,
      },
    ]);

    const modifications = await mergeEngine.modificationRepository.getAll();

    expect(modifications).toEqual([
      {
        id: 1,
        entity: "test_entity",
        operation: EntityModificationType.CreateDynamicField,
        data: pushOp.modifications[0].data,
        creationUUID: pushOp.modifications[0].creationUUID,
        domain: 1,
        submittedAt: pushOp.submittedAt,
        changedAt: pushOp.modifications[0].changedAt,
        uuid: pushOp.modifications[0].uuid,
      },
    ]);
  });

  it('should update the dynamic field if it already exists', async () => {
    const entityUUID = v4();

    const entity = {
      test: "test",
      test2: "test2",
      creationUUID: entityUUID,
      changedAt: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      submittedAt: new Date(),
      domain: 1,
    }

    await simpleRepository.create(entity);

    const dynamicField = {
      key: "test",
      value: "test",
      entity: "test_entity",
      creationUUID: entityUUID,
      submittedAt: new Date(),
      changedAt: new Date(),
      createdAt: new Date(),
      wasDeleted: false,
    }

    await mergeEngine.dynamicFieldRepository.create(dynamicField);

    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      operation: EntityModificationType.CreateDynamicField,
      creationUUID: entityUUID,
      uuid: v4(),
      data: {
        key: "test",
        value: "test3",
      },
      changedAt: new Date(),
    }).build()

    await mergeEngine.createDynamicFieldStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const dynamicFields = await mergeEngine.dynamicFieldRepository.getAll();

    expect(dynamicFields).toEqual([
      {
        id: 1,
        key: "test",
        value: "test3",
        entity: "test_entity",
        submittedAt: pushOp.submittedAt,
        changedAt: pushOp.modifications[0].changedAt,
        createdAt: pushOp.modifications[0].changedAt,
        creationUUID: pushOp.modifications[0].creationUUID,
        wasDeleted: false,
      },
    ]);

    const modifications = await mergeEngine.modificationRepository.getAll();

    expect(modifications).toEqual([
      {
        id: 1,
        entity: "test_entity",
        operation: EntityModificationType.CreateDynamicField,
        data: pushOp.modifications[0].data,
        creationUUID: pushOp.modifications[0].creationUUID,
        domain: 1,
        submittedAt: pushOp.submittedAt,
        changedAt: pushOp.modifications[0].changedAt,
        uuid: pushOp.modifications[0].uuid,
      },
    ]);
  });
});