import {MigrationRunner} from "../../src/migration/migration-runner";
import {setupTests} from "../helpers/setup-tests";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";

describe("MigrationRunner", () => {
  let migrationRunner: MigrationRunner;
  let commonDb: SqliteAdapter;

  beforeEach(async () => {
    const { syncEngine, commonDb } = setupTests();
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

  describe("runAll", () => {});

  describe("ServerSyncEngine integration", () => {});
})