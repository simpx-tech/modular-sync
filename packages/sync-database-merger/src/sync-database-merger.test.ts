import supertest from "supertest";
import {setupTests} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import {setupAuthentication} from "@simpx/sync-core/__tests__/helpers/setup-authentication";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {Express} from "express";
import {setupRepositories} from "@simpx/sync-core/__tests__/helpers/setup-repositories";
import {DatabaseAdapter} from "@simpx/sync-core/src/interfaces/database-adapter";
import {setupDomains} from "@simpx/sync-core/__tests__/helpers/setup-domains";
import {v4} from "uuid";

describe("Sync Database Merger", () => {
  let token: string;
  let syncEngine: ServerSyncEngine;
  let app: Express;
  let commonDb: DatabaseAdapter;

  beforeEach(async () => {
    ({ syncEngine, app, commonDb } = setupTests());

    await syncEngine.runSetup();

    ({ token } = await setupAuthentication(syncEngine));
    await setupRepositories(syncEngine);
    await setupDomains(syncEngine);
  })

  describe("push", () => {
    it("should create the domain if it doesn't exist yet", async () => {
      const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "3" }).send({
        entities: {},
        finished: false,
      }).set("Authorization", `Bearer ${token}`);

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

    it("should update domain's isMigrated to true on last receiveAll call", async () => {
      const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "3" }).send({
        entities: {},
        finished: true,
      }).set("Authorization", `Bearer ${token}`);

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

    describe("Unified fields", () => {
      it("should receive and store all entities from a domain", async () => {
        const res = await supertest(app).post("/sync/test-domain/push").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`).send({
          entities: {
            "test_entity": [
              {
                fields: {
                  create: [
                    {
                      key: "test",
                      value: "test"
                    },
                    {
                      key: "test2",
                      value: "test2"
                    }
                  ],
                  update: [],
                  delete: [],
                },
                uuid: v4(),
                wasDeleted: false,
                createdAt: "2023-01-01T00:00:00.000Z",
                updatedAt: "2023-01-01T00:00:00.000Z",
                submittedAt: "2023-01-01T00:00:00.000Z",
              },
              {
                fields: {
                  create: [
                    {
                      key: "test",
                      value: "test3"
                    },
                    {
                      key: "test2",
                      value: "test4"
                    }
                  ],
                  update: [],
                  delete: [],
                },
                uuid: v4(),
                wasDeleted: false,
                createdAt: "2023-01-02T00:00:00.000Z",
                updatedAt: "2023-01-02T00:00:00.000Z",
                submittedAt: "2023-01-02T00:00:00.000Z",
              }
            ],
            "test_entity_2": [
              {
                fields: {
                  create: [
                    {
                      key: "test",
                      value: "test5"
                    },
                    {
                      key: "test2",
                      value: "test6"
                    }
                  ],
                  update: [],
                  delete: [],
                },
                uuid: v4(),
                wasDeleted: false,
                createdAt: "2023-01-03T00:00:00.000Z",
                updatedAt: "2023-01-03T00:00:00.000Z",
                submittedAt: "2023-01-03T00:00:00.000Z",
              }
            ]
          },
          finished: true,
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ entities: {}, lastSubmittedAt: "2023-01-03T00:00:00.000Z" });

        /* Should create the entities on the database */
        const testEntities = await commonDb.raw({ sql: "SELECT * FROM test_entity", params: [], isQuery: true, fetchAll: true });
        expect(testEntities).toEqual([{
          id: 1,
          repository: 1,
          domain: 1,
          test: "test",
          test2: "test2",
          createdAt: new Date("2023-01-01T00:00:00.000Z").getTime(),
          updatedAt: new Date("2023-01-01T00:00:00.000Z").getTime(),
          submittedAt: new Date("2023-01-01T00:00:00.000Z").getTime(),
          wasDeleted: 0,
        }, {
          id: 2,
          repository: 1,
          domain: 1,
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
          repository: 1,
          domain: 1,
          createdAt: new Date("2023-01-03T00:00:00.000Z").getTime(),
          updatedAt: new Date("2023-01-03T00:00:00.000Z").getTime(),
          submittedAt: new Date("2023-01-03T00:00:00.000Z").getTime(),
          wasDeleted: 0,
        }])

        const modifications = await commonDb.raw({ sql: "SELECT * FROM sync_modifications", params: [], isQuery: true, fetchAll: true });
        expect(modifications).toEqual([{
          id: 1,
          repository: 1,
          domain: 1,
          entity: "test_entity",
          operation: "create",
          uuid: expect.any(String),
          entityId: 1,
          submittedAt: "2023-01-01T00:00:00.000Z",
          updatedAt: "2023-01-01T00:00:00.000Z",
          wasDeleted: 0,
          fieldOperations: JSON.stringify({
            create: [{
              key: "test",
              value: "test"
            }, {
              key: "test2",
              value: "test2"
            }],
            update: [],
            delete: [],
          }),
        }, {
          id: 2,
          repository: 1,
          domain: 1,
          entity: "test_entity",
          operation: "create",
          entityId: 2,
          uuid: expect.any(String),
          submittedAt: "2023-01-02T00:00:00.000Z",
          updatedAt: "2023-01-02T00:00:00.000Z",
          wasDeleted: 0,
          fieldOperations: JSON.stringify({
            create: [{
              key: "test",
              value: "test3"
            }, {
              key: "test2",
              value: "test4"
            }],
            update: [],
            delete: [],
          }),
        }, {
          id: 3,
          repository: 1,
          domain: 1,
          entity: "test_entity_2",
          operation: "create",
          entityId: 1,
          uuid: expect.any(String),
          submittedAt: "2023-01-03T00:00:00.000Z",
          updatedAt: "2023-01-03T00:00:00.000Z",
          wasDeleted: 0,
          fieldOperations: JSON.stringify({
            create: [{
              key: "test",
              value: "test5"
            }, {
              key: "test2",
              value: "test6"
            }],
            update: [],
            delete: [],
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