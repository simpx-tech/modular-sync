import {setupTests} from "../../helpers/setup-tests";
import {DomainRepository} from "../../../src/repositories/domain-repository";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../../../src/server/server-sync-engine";
import {setupRepositories} from "../../helpers/setup-repositories";
import {setupAuthentication} from "../../helpers/setup-authentication";

describe("Domain Repository", () => {
  let commonDb: SqliteAdapter;
  let syncEngine: ServerSyncEngine;

  beforeEach(async () => {
    ({ commonDb, syncEngine } = setupTests());
    await syncEngine.runSetup()
    await setupAuthentication(syncEngine);
    await setupRepositories(syncEngine);
  });

  describe("Domain Repository Setup", () => {
    it("should have created the domain table", async () => {
      const tables = await commonDb.raw({ sql: "SELECT name FROM sqlite_master WHERE type='table';", params: [], isQuery: true, fetchAll: true })

      expect(tables.map(t => t.name)).toContain(DomainRepository.ENTITY);
    });
  });

  describe("getByRepositoryId", () => {
    it("should return the domain by repository id", async () => {
      await syncEngine.domainRepository.create({
        name: "test",
        repository: 1,
        isMigrated: false,
      });

      const domain = await syncEngine.domainRepository.getByRepositoryId(1);
      expect(domain).toEqual({
        id: 1,
        name: "test",
        repository: 1,
        isMigrated: false,
      });
    });
  });

  describe("create", () => {
    it("should create the domain", async () => {
      const created = await syncEngine.domainRepository.create({
        name: "test",
        repository: 1,
        isMigrated: false,
      });

      expect(created).toEqual({
        id: 1,
        name: "test",
        repository: 1,
        isMigrated: false,
      });
    });
  });

  describe("update", () => {
    it("should update the domain", async () => {
      await syncEngine.domainRepository.create({
        name: "test",
        repository: 1,
        isMigrated: false,
      });

      const updated = await syncEngine.domainRepository.update(1, {
        isMigrated: true,
      });

      expect(updated).toEqual({
        id: 1,
        name: "test",
        repository: 1,
        isMigrated: true,
      });
    });
  });

  describe("deleteByRepositoryId", () => {
    it("should delete the domain by repository id", async () => {
      await syncEngine.domainRepository.create({
        name: "test",
        repository: 1,
        isMigrated: false,
      });

      await syncEngine.domainRepository.create({
        name: "test2",
        repository: 1,
        isMigrated: false,
      });

      const deleted = await syncEngine.domainRepository.deleteByRepositoryId(1);
      expect(deleted).toEqual({
        wasDeleted: true,
      });
      expect(await commonDb.getAll("sync_domains")).toEqual([]);
    });
  })
});