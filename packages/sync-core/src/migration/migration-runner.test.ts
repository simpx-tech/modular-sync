import {MigrationRunner} from "./migration-runner";
import {setupTests} from "../../__tests__/helpers/setup-tests";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../server/server-sync-engine";
import {Migration} from "../interfaces/migration";

describe("MigrationRunner", () => {
  let migrationRunner: MigrationRunner;
  let commonDb: SqliteAdapter;
  let syncEngine: ServerSyncEngine;

  beforeEach(async () => {
    ({ syncEngine, commonDb } = setupTests());
    migrationRunner = syncEngine.migrationRunner;
    await commonDb.connect();
  })

  describe("runSetup", () => {
    it ("should create the migrations table", async () => {
      await migrationRunner.runSetup();

      const res = await commonDb.raw({ sql: `SELECT * FROM sqlite_master WHERE type='table' AND name='${MigrationRunner.MIGRATION_ENTITY}'`, params: [], isQuery: true, fetchAll: true });

      expect(res[0]?.name).toStrictEqual(MigrationRunner.MIGRATION_ENTITY);
    })
  });

  describe("runAll", () => {
    it ("should run all migrations", async () => {
      await migrationRunner.runSetup();

      class TestMigration implements Migration {
        async runOnce(database) {
          await database.raw({ sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)", params: [] });
        }
      }

      class TestMigration2 implements Migration {
        async runOnce(database) {
          await database.raw({ sql: "CREATE TABLE IF NOT EXISTS test2 (id INTEGER PRIMARY KEY)", params: [] });
        }
      }

      migrationRunner.registerMigration(new TestMigration());
      migrationRunner.registerMigration(new TestMigration2());

      await migrationRunner.runAllMigrations();

      const res = await commonDb.raw({ sql: `SELECT * FROM sqlite_master WHERE type='table' AND name='test'`, params: [], isQuery: true, fetchAll: true });
      const res2 = await commonDb.raw({ sql: `SELECT * FROM sqlite_master WHERE type='table' AND name='test2'`, params: [], isQuery: true, fetchAll: true });

      expect(res.length).toStrictEqual(1);
      expect(res2.length).toStrictEqual(1);

      const migration = await commonDb.raw({ sql: `SELECT * FROM ${MigrationRunner.MIGRATION_ENTITY}`, params: [], isQuery: true, fetchAll: true });
      expect(migration.length).toStrictEqual(2);

      expect(migration[0]).toEqual({ id: 1, domain: "sync", name: "TestMigration", migratedAt: expect.any(Number) });
      expect(migration[1]).toEqual({ id: 2, domain: "sync", name: "TestMigration2", migratedAt: expect.any(Number) });
    })

    it("should skip migrations that already ran", async () => {
      await migrationRunner.runSetup();
      await commonDb.raw({ sql: "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, value INTEGER)", params: [] });

      class TestMigration implements Migration {
        async runOnce(database) {
          await database.raw({ sql: "INSERT INTO test(value) VALUES(1)", params: [] });
        }
      }

      migrationRunner.registerMigration(new TestMigration());

      await migrationRunner.runAllMigrations();
      await migrationRunner.runAllMigrations();

      const res = await commonDb.raw({ sql: `SELECT * FROM test`, params: [], isQuery: true, fetchAll: true });
      expect(res.length).toStrictEqual(1);
      expect(res).toEqual([{ id: 1, value: 1 }]);
    });

    it("should prefer customName instead of the class name", async () => {
      await migrationRunner.runSetup();

      migrationRunner.registerMigration(new class TestMigration implements Migration {
        customName = "nameless-migration";

        async runOnce(db) {}
      }());

      await migrationRunner.runAllMigrations();

      expect(migrationRunner.migrations.size).toStrictEqual(1);
      const res = await commonDb.raw({ sql: `SELECT * FROM ${MigrationRunner.MIGRATION_ENTITY}`, params: [], isQuery: true, fetchAll: true });

      expect(res).toEqual([{ id: 1, domain: "sync", name: "nameless-migration", migratedAt: expect.any(Number) }]);
    })

    it("should name a migration as unknown if it's from nameless class and without customName", async () => {
      await migrationRunner.runSetup();

      migrationRunner.registerMigration(new class implements Migration {
        async runOnce(db) {}
      }());

      await migrationRunner.runAllMigrations();

      expect(migrationRunner.migrations.size).toStrictEqual(1);
      const res = await commonDb.raw({ sql: `SELECT * FROM ${MigrationRunner.MIGRATION_ENTITY}`, params: [], isQuery: true, fetchAll: true });

      expect(res).toEqual([{ id: 1, domain: "sync", name: "unknown", migratedAt: expect.any(Number) }]);
    })
  });

  describe("ServerSyncEngine integration", () => {
    it("should create migrations, repository, users and domain tables", async () => {
      await syncEngine.runSetup();

      const res = await commonDb.raw({ sql: `SELECT * FROM sqlite_master WHERE type='table' AND name LIKE 'sync_%'`, params: [], isQuery: true, fetchAll: true });

      expect(res.length).toStrictEqual(6);
      expect(res[0]?.name).toStrictEqual("sync_schema_migrations");
      expect(res[1]?.name).toStrictEqual("sync_users");
      expect(res[2]?.name).toStrictEqual("sync_modifications");
      expect(res[3]?.name).toStrictEqual("sync_dynamic_field");
      expect(res[4]?.name).toStrictEqual("sync_repositories");
      expect(res[5]?.name).toStrictEqual("sync_domains");
    })
  });
})
