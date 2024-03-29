import {setupTests} from "../../../__tests__/helpers/setup-tests";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../../server/server-sync-engine";
import {setupRepositories} from "../../../__tests__/helpers/setup-repositories";
import {setupAuthentication} from "../../../__tests__/helpers/setup-authentication";
import {DOMAIN_ENTITY} from "./domain-repository-constants";
import {QueryBuilder} from "../../common/query-builder";

describe("Domain Repository", () => {
  let commonDb: SqliteAdapter;
  let syncEngine: ServerSyncEngine;

  beforeEach(async () => {
    ({ commonDb, syncEngine } = setupTests());
    await syncEngine.runSetup();
    await setupAuthentication(syncEngine);
    await setupRepositories(syncEngine);
  });

  describe("Domain Repository Setup", () => {
    it("should have created the domain table", async () => {
      const tables = await commonDb.raw({ sql: "SELECT name FROM sqlite_master WHERE type='table';", params: [], isQuery: true, fetchAll: true })

      expect(tables.map(t => t.name)).toContain(DOMAIN_ENTITY);
    });
  });

  describe("getAllByRepositoryId", () => {
    it("should return all the domains by repository id", async () => {
      const domains = await syncEngine.domainRepository.getAllByRepositoryId(1);
      expect(domains).toEqual([{
        id: 1,
        name: "test-domain",
        repository: 1,
        isMigrated: false,
      }]);
    });

    it("should return empty array if the repository was not found", async () => {
      const domains = await syncEngine.domainRepository.getAllByRepositoryId(4);
      expect(domains).toEqual([]);
    })

    it("should allow query with string id", async () => {
      const domains = await syncEngine.domainRepository.getAllByRepositoryId("1");
      expect(domains).toEqual([{
        id: 1,
        name: "test-domain",
        repository: 1,
        isMigrated: false,
      }]);
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

      const res = await commonDb.query(new QueryBuilder("sync_domains"));
      expect(res).toEqual([{ id: 1, name: "test", repository: 1, isMigrated: 0 }]);
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
      expect(await commonDb.query( new QueryBuilder("sync_domains"))).toEqual([]);
    });
  })

  describe("createIfNotExists", () => {
    it("should create the domain if it doesn't exist yet", async () => {
      const created = await syncEngine.domainRepository.createIfNotExists(["name", "repository"], {
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

    it("should duplicate if the domain already exists", async () => {
      await syncEngine.domainRepository.create({
        name: "test",
        repository: 1,
        isMigrated: false,
      });

      const created = await syncEngine.domainRepository.createIfNotExists(["name", "repository"],{
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

      const domains = await commonDb.query(new QueryBuilder("sync_domains"));
      expect(domains).toEqual([{
        id: 1,
        name: "test",
        repository: 1,
        isMigrated: 0,
      }]);
    });
  })
});