import {SqliteAdapter} from "../src/sqlite-adapter";
import fs from "fs";

describe("SQLite Adapter Connection", () => {
  let sqliteAdapter: SqliteAdapter = null;

  beforeEach(async () => {
    sqliteAdapter = new SqliteAdapter({ databasePath: "./__tests__/data/__tests__.sqlite" });
  });

  afterEach(async () => {
    await sqliteAdapter.disconnect();
    fs.unlinkSync("./__tests__/data/__tests__.sqlite");
  })

  it("should connect properly", async () => {
    await sqliteAdapter.connect();
    const exists = fs.existsSync("./__tests__/data/__tests__.sqlite");
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