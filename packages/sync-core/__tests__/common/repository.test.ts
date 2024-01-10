import {RepositoryFactory} from "../../src/common/repository-factory";
import {SchemaType} from "../../src/interfaces/database-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerDomain} from "../../src/server/server-domain";
import {setupTests} from "../helpers/setup-tests";

describe("Repository", () => {
  let syncEngine: ServerSyncEngine;
  let commonDb: SqliteAdapter;
  let domain: ServerDomain;

  beforeEach(async () => {
    ({ syncEngine, commonDb, domain } = setupTests());
    await commonDb.connect();
  })

  describe("create", () => {
    it("should create and convert data types properly", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      const res = await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      expect(res).toEqual({
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })
    });
  })

  describe("getFirst", () => {
    it("should get first and convert data types properly", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repository.getFirst();

      expect(res).toEqual({
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })
    });
  })

  describe("getById", () => {
    it("should get by id", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repository.getById(2);

      expect(res).toEqual({
        id: 2,
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })
    });
  })

  describe("getByField", () => {
    it("should get by field", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      const first = {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      }

      const second = {
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      }

      await repository.create(first)
      await repository.create(second)

      const res = await repository.getByField({ test: "test2" });
      const res2 = await repository.getByField({ test2: 1 });
      const res3 = await repository.getByField({ test3: false });
      const res4 = await repository.getByField({ test4: new Date("2021-01-01") });

      const firstWithId = { ...first, id: 1 };
      const secondWithId = { ...second, id: 2 };

      expect(res).toEqual(secondWithId)
      expect(res2).toEqual(firstWithId)
      expect(res3).toEqual(secondWithId)
      expect(res4).toEqual(firstWithId)
    });
  })

  describe("getAllByField", () => {
    it("should get all by field", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repository.create({
        test: "test2",
        test2: 1,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repository.getAllByField({ test2: 1 });

      expect(res).toEqual([{
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      }, {
        id: 2,
        test: "test2",
        test2: 1,
        test3: false,
        test4: new Date("2021-01-02"),
      }])
    });
  })

  describe("getAll", () => {
    it("should get all from entity", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repository.getAll();

      expect(res).toEqual([{
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      }, {
        id: 2,
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      }])
    });
  })

  describe("createIfNotExists", () => {
    it("should create it if it not exists and not duplicate", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      }, { unique: ["test"] });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.createIfNotExists(["test"], {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repository.createIfNotExists(["test"], {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const res = await repository.getAll();

      expect(res).toEqual([{
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      }])
    });
  })

  describe("update", () => {
    it("should update", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const updated = await repository.update(1, {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      expect(updated).toEqual({
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      });

      const all = await repository.getAll();

      expect(all).toEqual([{
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      }])
    });
  })

  describe("delete", () => {
    it("should delete", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const wasDeleted = await repository.delete(1)
      expect(wasDeleted).toEqual({
        wasDeleted: true,
      });

      const all = await repository.getAll();
      expect(all).toEqual([])
    });
  })

  describe("deleteByField", () => {
    it("should delete based on provided keys", async () => {
      const repository = RepositoryFactory.create("test_entity", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      await repository.runSetup(domain, syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const wasDeleted = await repository.deleteByField({ test: "test2" })
      expect(wasDeleted).toEqual({
        wasDeleted: true,
      });

      const all = await repository.getAll();
      expect(all).toEqual([{
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      }])
    });
  })

  describe("registerCreateMiddleware", () => {
    it.todo("should register create middleware");
  })

  describe("registerUpdateMiddleware", () => {
    it.todo("should register update middleware");
  })

  describe("registerDeleteMiddleware", () => {
    it.todo("should register delete middleware");
  })
});
