import supertest from "supertest";
import {setupTests} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import {setupAuthentication} from "@simpx/sync-core/__tests__/helpers/setup-authentication";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {Express} from "express";
import {setupRepositories} from "@simpx/sync-core/__tests__/helpers/setup-repositories";
import {DatabaseAdapter} from "@simpx/sync-core/src/interfaces/database-adapter";
import {setupDomains} from "@simpx/sync-core/__tests__/helpers/setup-domains";

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

  describe("bulk-write", () => {
    it("should create the domain if it doesn't exist yet", async () => {
      const res = await supertest(app).post("/sync/test-domain/bulk-write").query({ repositoryId: "3" }).send({
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
      const res = await supertest(app).post("/sync/test-domain/bulk-write").query({ repositoryId: "3" }).send({
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

    it("should fail if domain is already migrated (should sync instead)", async () => {
      await syncEngine.domainRepository.update(1, { isMigrated: true });

      const res = await supertest(app).post("/sync/test-domain/bulk-write").query({ repositoryId: "1" }).set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(409);
    })

    it.todo("should allow receive all entities from a domain")

    it.todo("should allow receive the same entities without problem (and not create duplicates)")

    it.todo("should allow receive the same entities and update them if necessary (and not create duplicates)")
  });

  describe("bulk-read", () => {
    it.todo("should fail if it was not migrated yet")

    it.todo("should return all entities from a domain")

    it.todo("should indicate that is the last page")

    it.todo("lastSubmittedAt should match the lasted submittedAt from returned entities")
  });

  describe("sync", () => {});
});