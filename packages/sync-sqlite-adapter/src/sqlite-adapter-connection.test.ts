import {SqliteAdapter} from "./sqlite-adapter";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import {__createTmpDirIfNotExists} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import * as os from "os";

describe("SQLite Adapter Connection", () => {
  let sqliteAdapter: SqliteAdapter = null;
  let dbFileName: string;

  beforeEach(async () => {
    dbFileName = `${crypto.randomUUID()}.db`;
    __createTmpDirIfNotExists();
    sqliteAdapter = new SqliteAdapter({ databasePath: path.join(os.tmpdir(), "modular-sync-tmp", dbFileName) });
  });

  afterEach(async () => {
    await sqliteAdapter.disconnect();
  })

  it("should connect properly", async () => {
    await sqliteAdapter.connect();
    const exists = fs.existsSync(path.join(os.tmpdir(), "modular-sync-tmp", dbFileName));
    expect(exists).toBe(true);
  })

  it("should allow connect twice without problem", async () => {
    await sqliteAdapter.connect();
    await sqliteAdapter.connect();
    expect(true).toBe(true)
  })

  it("should disconnect properly", async () => {
    await sqliteAdapter.connect();
    await sqliteAdapter.disconnect();

    const promise = sqliteAdapter.raw({ sql: "SELECT * FROM __tests__", params: [] });

    await expect(promise).rejects.toThrow();
  })

  it("should allow disconnect twice without problem", async () => {
    await sqliteAdapter.connect();
    await sqliteAdapter.disconnect();
    await sqliteAdapter.disconnect();

    expect(true).toBe(true)
  })
})