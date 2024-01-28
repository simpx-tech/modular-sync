import {SqliteAdapter} from "./sqlite-adapter";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import {__createTmpDirIfNotExists} from "@simpx/sync-core/__tests__/helpers/setup-tests";

describe("SQLite Adapter Connection", () => {
  let sqliteAdapter: SqliteAdapter = null;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = `${crypto.randomUUID()}.db`;
    __createTmpDirIfNotExists();
    sqliteAdapter = new SqliteAdapter({ databasePath: path.join(__dirname, "modular-sync-tmp", dbPath) });
  });

  afterEach(async () => {
    await sqliteAdapter.disconnect();
    fs.unlinkSync(path.join(__dirname, "./data", dbPath));
  })

  it("should connect properly", async () => {
    await sqliteAdapter.connect();
    const exists = fs.existsSync(path.join(__dirname, "./data", dbPath));
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