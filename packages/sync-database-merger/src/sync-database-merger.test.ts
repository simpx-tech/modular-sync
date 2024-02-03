import supertest from "supertest";
import {setupTests} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import {setupAuthentication} from "@simpx/sync-core/__tests__/helpers/setup-authentication";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {Express} from "express";
import {setupRepositories} from "@simpx/sync-core/__tests__/helpers/setup-repositories";
import {setupDomains} from "@simpx/sync-core/__tests__/helpers/setup-domains";
import {v4} from "uuid";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {expect} from "@jest/globals";
import {DatabaseMerger} from "./sync-database-merger";
import {PushOperationBuilder} from "@simpx/sync-core/src/helpers/push-operation-builder";
import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";

describe("Sync Database Merger", () => {
  let token: string;
  let syncEngine: ServerSyncEngine;
  let app: Express;
  let commonDb: SqliteAdapter;

  beforeEach(async () => {
    ({ syncEngine, app, commonDb } = setupTests());

    await syncEngine.runSetup();

    ({ token } = await setupAuthentication(syncEngine));
    await setupRepositories(syncEngine);
    await setupDomains(syncEngine);
  })

  describe("push", () => {
    it("should create the domain if it doesn't exist yet", async () => {
      const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "3" }).send(new PushOperationBuilder().build()).set("Authorization", `Bearer ${token}`);

      const domains = await commonDb.raw({ sql: "SELECT * FROM sync_domains WHERE repository = 3", params: [], isQuery: true, fetchAll: true });

      expect(res.status).toBe(200);
      expect(domains).toEqual([
        {
          id: 3,
          name: "test-domain",
          repository: 3,
          isMigrated: 0,
        }
      ]);
    })

    it("should update domain's isMigrated to true on last push call", async () => {
      const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "3" }).send(new PushOperationBuilder().setFinished(true).build()).set("Authorization", `Bearer ${token}`);

      const domains = await commonDb.raw({ sql: "SELECT * FROM sync_domains WHERE repository = 3", params: [], isQuery: true, fetchAll: true });

      expect(res.status).toBe(200);
      expect(domains).toEqual([
        {
          id: 3,
          name: "test-domain",
          repository: 3,
          isMigrated: 1,
        }
      ]);
    })

    it("should fail if domain is already migrated (user should call sync endpoint instead)", async () => {
      await syncEngine.domainRepository.update(1, { isMigrated: true });

      const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(409);
    })

    it(`should execute CreateEntityStrategy if operation is 'create-entity'`, async () => {
      const uuid = v4();
      const entityUUID = v4();

      const spy = jest.spyOn((syncEngine.domains[0].mergeEngine as DatabaseMerger).createEntityStrategy, "handle");

      const pushOp = new PushOperationBuilder().addModification({
        entity: "test_entity",
        operation: EntityModificationType.CreateEntity,
        uuid: uuid,
        changedAt: new Date("2023-01-01T00:00:00.000Z"),
        creationUUID: entityUUID,
        data: {
          test: "test",
          test2: "test2"
        }
      }).build();

      const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send(pushOp);

      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    })

    it("should execute UpdateEntityStrategy if operation is 'update-entity'", async () => {
      const uuid = v4();
      const entityUUID = v4();

      const spy = jest.spyOn((syncEngine.domains[0].mergeEngine as DatabaseMerger).updateEntityStrategy, "handle");

      const pushOp = new PushOperationBuilder().addModification({
        entity: "test_entity",
        operation: EntityModificationType.UpdateEntity,
        uuid: uuid,
        changedAt: new Date("2023-01-01T00:00:00.000Z"),
        creationUUID: entityUUID,
        data: {
          test: "test",
          test2: "test2"
        }
      }).build();

      await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send(pushOp);

      expect(spy).toHaveBeenCalled();
    });

    it("should execute DeleteEntityStrategy if operation is 'delete-entity'", async () => {
      const uuid = v4();
      const entityUUID = v4();

      const spy = jest.spyOn((syncEngine.domains[0].mergeEngine as DatabaseMerger).deleteEntityStrategy, "handle");

      const pushOp = new PushOperationBuilder().addModification({
        entity: "test_entity",
        operation: EntityModificationType.DeleteEntity,
        uuid: uuid,
        changedAt: new Date("2023-01-01T00:00:00.000Z"),
        creationUUID: entityUUID,
        data: {
          test: "test",
          test2: "test2"
        }
      }).build();

      await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send(pushOp);

      expect(spy).toHaveBeenCalled();
    });

    it("should execute CreateDynamicFieldStrategy if operation is 'create-dynamic-field'", async () => {
      const uuid = v4();
      const entityUUID = v4();

      const spy = jest.spyOn((syncEngine.domains[0].mergeEngine as DatabaseMerger).createDynamicFieldStrategy, "handle");

      const pushOp = new PushOperationBuilder().addModification({
        entity: "test_entity",
        operation: EntityModificationType.CreateDynamicField,
        uuid: uuid,
        changedAt: new Date("2023-01-01T00:00:00.000Z"),
        creationUUID: entityUUID,
        data: {
          test: "test",
          test2: "test2"
        }
      }).build();

      await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send(pushOp);

      expect(spy).toHaveBeenCalled();
    });

    it("should execute UpdateDynamicFieldStrategy if operation is 'update-dynamic-field'", async () => {
      const uuid = v4();
      const entityUUID = v4();

      const spy = jest.spyOn((syncEngine.domains[0].mergeEngine as DatabaseMerger).updateDynamicFieldStrategy, "handle");

      const pushOp = new PushOperationBuilder().addModification({
        entity: "test_entity",
        operation: EntityModificationType.UpdateDynamicField,
        uuid: uuid,
        changedAt: new Date("2023-01-01T00:00:00.000Z"),
        creationUUID: entityUUID,
        data: {
          test: "test",
          test2: "test2"
        }
      }).build();

      await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send(pushOp);

      expect(spy).toHaveBeenCalled();
    });

    it("should execute DeleteDynamicFieldStrategy if operation is 'delete-dynamic-field'", async () => {
      const uuid = v4();
      const entityUUID = v4();

      const spy = jest.spyOn((syncEngine.domains[0].mergeEngine as DatabaseMerger).deleteDynamicFieldStrategy, "handle");

      const pushOp = new PushOperationBuilder().addModification({
        entity: "test_entity",
        operation: EntityModificationType.DeleteDynamicField,
        uuid: uuid,
        changedAt: new Date("2023-01-01T00:00:00.000Z"),
        creationUUID: entityUUID,
        data: {
          test: "test",
          test2: "test2"
        }
      }).build();

      await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send(pushOp);

      expect(spy).toHaveBeenCalled();
    });

    // TODO implement
    it.todo("should stop and revert the merge if the strategy fails")

    describe("Unified fields", () => {
      // TODO first focus on the static fields (schema fields), then test the dynamic fields
      // TODO consider what is the type of the operation (create, update, delete)
      // TODO on create, first create entity and check if has other updates
      // TODO on update, simply update fields (see below)
      // TODO on delete, simply delete the entity (consider, when receiving update and delete updates at the same request)
      // TODO on client, if delete entity, simply ignore all modifications, send a simple delete request, the server will delete the entity but
      // TODO store all modifications to the entity before the deletion
      // TODO if operation="delete" can remove the wasDeleted from the request
      // TODO maybe add a deletedAt field, since can receive modification after deletion updates from other outdated clients

      // TODO on client side, has to consider when create and update then submit to the server, the server will receive a create and a update request (?)
      // TODO maybe merge the create and update into one operation (upsert?), or maybe, the create can receive updates by default, but the update operation always consider
      // TODO that the object was already created
      it.skip("should receive and store all entities from a domain", async () => {
        const uuid1 = v4();
        const entityUUID1 = v4();

        const uuid2 = v4();
        const entityUUID2 = v4();

        const uuid3 = v4();
        const entityUUID3 = v4();

        const pushOp = new PushOperationBuilder().addModification({
          entity: "test_entity",
          changedAt: new Date("2023-01-01T00:00:00.000Z"),
          operation: EntityModificationType.CreateEntity,
          creationUUID: entityUUID1,
          uuid: uuid1,
          data: {
            name: "name",
            name2: "name2"
          }
        }).addModification({
          entity: "test_entity",
          changedAt: new Date("2023-01-01T00:00:00.000Z"),
          operation: EntityModificationType.CreateEntity,
          creationUUID: entityUUID2,
          uuid: uuid2,
          data: {
            name: "name3",
            name2: "name4"
          }
        }).addModification({
          entity: "test_entity_2",
          changedAt: new Date("2023-01-01T00:00:00.000Z"),
          operation: EntityModificationType.CreateEntity,
          creationUUID: entityUUID3,
          uuid: uuid3,
          data: {
            name: "name5",
            name2: "name6"
          }
        }).build();

        const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send(pushOp);

        expect(res.status).toBe(200);

        expect(res.body).toEqual({ status: "success", lastSubmittedAt: "2023-01-03T00:00:00.000Z" });

        /* Should create the entities on the database */
        const testEntities = await commonDb.raw({ sql: "SELECT * FROM test_entity", params: [], isQuery: true, fetchAll: true });
        expect(testEntities).toEqual([{
          id: 1,
          repository: 1,
          domain: 1,
          test: "test",
          creationUUID: uuid1,
          test2: "test2",
          createdAt: new Date("2023-01-01T00:00:00.000Z").getTime(),
          updatedAt: new Date("2023-01-01T00:00:00.000Z").getTime(),
          submittedAt: new Date("2023-01-01T00:00:00.000Z").getTime(),
          wasDeleted: 0,
        }, {
          id: 2,
          repository: 1,
          domain: 1,
          creationUUID: uuid2,
          test: "test3",
          test2: "test4",
          createdAt: new Date("2023-01-02T00:00:00.000Z").getTime(),
          updatedAt: new Date("2023-01-02T00:00:00.000Z").getTime(),
          submittedAt: new Date("2023-01-02T00:00:00.000Z").getTime(),
          wasDeleted: 0,
        }])

        const testEntities2 = await commonDb.raw({ sql: "SELECT * FROM test_entity_2", params: [], isQuery: true, fetchAll: true });
        expect(testEntities2).toEqual([{
          id: 1,
          test: "test5",
          test2: "test6",
          creationUUID: uuid3,
          repository: 1,
          domain: 1,
          createdAt: new Date("2023-01-03T00:00:00.000Z").getTime(),
          updatedAt: new Date("2023-01-03T00:00:00.000Z").getTime(),
          submittedAt: new Date("2023-01-03T00:00:00.000Z").getTime(),
          wasDeleted: 0,
        }])

        /* Should save the modification */
        // TODO Remember to set uuid and creationUUID as index
        const modifications = await commonDb.raw({ sql: "SELECT * FROM sync_modifications", params: [], isQuery: true, fetchAll: true });
        expect(modifications).toEqual([{
          id: 1,
          repository: 1,
          domain: 1,
          entity: "test_entity",
          operation: "create-entity",
          uuid: uuid1,
          creationUUID: uuid1,
          submittedAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
          data: JSON.stringify({
            test: "test",
            test2: "test2",
          }),
        }, {
          id: 2,
          repository: 1,
          domain: 1,
          entity: "test_entity",
          operation: "create-entity",
          uuid: uuid2,
          creationUUID: uuid2,
          submittedAt: "2023-01-02T00:00:00.000Z",
          updatedAt: "2023-01-02T00:00:00.000Z",
          wasDeleted: 0,
          data: JSON.stringify({
            test: "test3",
            test2: "test4",
          }),
        }, {
          id: 3,
          repository: 1,
          domain: 1,
          entity: "test_entity_2",
          operation: "create-entity",
          uuid: uuid3,
          creationUUID: uuid3,
          submittedAt: "2023-01-03T00:00:00.000Z",
          updatedAt: "2023-01-03T00:00:00.000Z",
          wasDeleted: 0,
          data: JSON.stringify({
            test: "test5",
            test2: "test6",
          }),
        }])
      })

      it.todo("should allow receive the same entities without problem (and not create duplicates)")

      it.todo("should allow receive the same entities and update them if necessary (and not create duplicates)")

      it.todo("should ignore entities that doesn't exists on server and add a warning on log")
    })

    describe("separated fields", () => {})
  });

  describe("pull", () => {
    it.todo("should fail if it was not migrated yet")

    it.todo("should return all entities from a domain")

    it.todo("should indicate that is the last page")

    it.todo("lastSubmittedAt should match the lasted submittedAt from returned entities")
  });

  describe("sync", () => {});
});