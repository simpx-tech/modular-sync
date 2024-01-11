import {SqliteAdapter} from "../src/sqlite-adapter";
import fs from "fs";
import crypto from "crypto";
import path from "path";

describe("SQLite Adapter Connection", () => {
  let sqliteAdapter: SqliteAdapter = null;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = `${crypto.randomUUID()}.db`;
    sqliteAdapter = new SqliteAdapter({ databasePath: path.join(__dirname, "./data", dbPath) });
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