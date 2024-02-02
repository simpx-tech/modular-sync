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

describe('CreateEntityStrategy', () => {
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

  it('should insert the entity if it not exists yet', async () => {
    const uuid1 = v4();
    const pushOp = new PushOperationBuilder().addModification({
      entity: "test_entity",
      type: EntityModificationType.CreateEntity,
      creationUUID: uuid1,
      uuid: uuid1,
      data: {
        test: "test",
        test2: "test2",
      },
      changedAt: new Date(),
    }).build();

    await mergeEngine.createEntityStrategy.handle({ domainId: 1, repositoryId: 1 }, simpleRepository, pushOp.modifications[0], pushOp);

    const entities = await simpleRepository.getAll();

    expect(entities).toEqual([
      {
        id: 1,
        test: "test",
        test2: "test2",
        __creationUUID: uuid1,
        changedAt: pushOp.modifications[0].changedAt,
      }
    ]);
  });

  it('should update the entity if it already exists', () => {

  });

  it('should ignore this modification if the modification is already on the database', () => {

  });

  it('should save the modification on the database', () => {

  });
});