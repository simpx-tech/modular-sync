import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {RepositoryRepository} from "../../src/repositories/repository-repository";
import {DomainRepository} from "../../src/repositories/domain-repository";
import {Express} from "express";
import supertest from "supertest";
import {setupTests} from "../helpers/setup-tests";
import {clearAllFiles} from "../helpers/clear-all-files";
import {setupAuthentication} from "../helpers/setup-authentication";
import {MigrationRunner} from "../../src/migration/migration-runner";

describe("Server Sync Engine", () => {
  describe("Server Sync Engine Setup", () => {
    let syncEngine: ServerSyncEngine;
    let commonDb: SqliteAdapter;

    beforeEach(() => {
      ({ commonDb, syncEngine } = setupTests());
    })

    afterEach(async () => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      await commonDb.disconnect();
    })

    afterAll(async () => {
      await clearAllFiles();
    })

    it("should helpers the database tables and run repositories, auth and domain setups", async () => {
      syncEngine.metadataDatabase.connect = jest.fn().mockResolvedValue(undefined);
      syncEngine.authEngine.runSetup = jest.fn().mockResolvedValue(() => this);
      syncEngine.domains[0].runSetup = jest.fn().mockResolvedValue(() => this);

      jest.spyOn(RepositoryRepository.prototype, "runSetup").mockImplementation(function () { return this });
      jest.spyOn(DomainRepository.prototype, "runSetup").mockImplementation(function () { return this });
      jest.spyOn(MigrationRunner.prototype, "runSetup").mockImplementation(function () { return this });
      jest.spyOn(MigrationRunner.prototype, "runAllMigrations").mockImplementation(function () { return this });

      await syncEngine.runSetup();

      expect(syncEngine.metadataDatabase.connect).toHaveBeenCalledTimes(1);
      expect(syncEngine.repositoryRepository.runSetup).toHaveBeenCalledTimes(1);
      expect(syncEngine.domainRepository.runSetup).toHaveBeenCalledTimes(1);
      expect(syncEngine.authEngine.runSetup).toHaveBeenCalledTimes(1);
      expect(syncEngine.domains[0].runSetup).toHaveBeenCalledTimes(1);
    })
  });

  describe("Server Sync Engine Endpoints", () => {
    let syncEngine: ServerSyncEngine;
    let commonDb: SqliteAdapter;
    let app: Express;
    let token: string;

    beforeEach(async () => {
      ({ commonDb, syncEngine, app } = setupTests());

      await syncEngine.runSetup();

      ({ token } = await setupAuthentication(syncEngine));
    })

    afterEach(async () => {
      jest.clearAllMocks();
      await commonDb.disconnect();
    })

    describe("createRepositoryEndpoint", () => {
      it ("should fail if not authenticated", () => {
        supertest(app).post("/sync/repository").send({ name: "test-repository" }).expect(401);
      })

      it ("should create repository on database", async () => {
        const res = await supertest(app).post("/sync/repository").set("Authorization", `Bearer ${token}`).send({ name: "test-repository" });

        const data = await commonDb.getAll("sync_repositories");

        expect(res.status).toBe(200);
        expect(data).toEqual([{
          id: 1,
          user: 1,
          name: "test-repository",
        }]);
      })

      it ("should create the domains from that repository on database", async () => {
        const res = await supertest(app).post("/sync/repository").set("Authorization", `Bearer ${token}`).send({ name: "test-repository" });

        const data = await commonDb.getAll("sync_domains");

        expect(res.status).toBe(200);
        expect(data).toEqual([{
          id: 1,
          name: "test-domain",
          repository: 1,
          isMigrated: false,
        }]);
      })
    });
  });
});