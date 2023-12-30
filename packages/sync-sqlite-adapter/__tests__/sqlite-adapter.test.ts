import {SqliteAdapter} from "../src/sqlite-adapter";
import * as fs from "fs";
import BetterSqlite, {Database} from "better-sqlite3";
import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";

describe("SQLite Adapter", () => {
  let sqliteAdapter: SqliteAdapter = null;
  let database: Database = null;

  beforeEach(async () => {
    sqliteAdapter = new SqliteAdapter({ databasePath: "./__tests__/data/__tests__.sqlite" });
    await sqliteAdapter.connect();

    database = new BetterSqlite("./__tests__/data/__tests__.sqlite");
    database.exec("CREATE TABLE IF NOT EXISTS __tests__ (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
    database.exec("CREATE TABLE IF NOT EXISTS test2 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, table_id INTEGER, FOREIGN KEY(table_id) REFERENCES __tests__(id))");
  })

  afterEach(async () => {
    await sqliteAdapter.disconnect();
    fs.unlinkSync("./__tests__/data/__tests__.sqlite");
  })

  it("should get the first item from a table", () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('__tests__'), ('test2'), ('test3')");

    const promise = sqliteAdapter.getFirst("test");

    return expect(promise).resolves.toEqual({ id: 1, name: "test" });
  })

  it("should get the an item by id", () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('__tests__'), ('test2'), ('test3')");

    const promise = sqliteAdapter.getById("test", 2);

    return expect(promise).resolves.toEqual({ id: 2, name: "test2" });
  })

  it("should list all items from a __tests__", () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('__tests__'), ('test2'), ('test3')");

    const promise = sqliteAdapter.getAll("test");

    return expect(promise).resolves.toEqual([{ id: 1, name: "test" }, { id: 2, name: "test2" }, { id: 3, name: "test3" }]);
  })

  it("should get an item by field", async () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('__tests__')");
    const promise = sqliteAdapter.getByField("test", { name: "test" });
    return expect(promise).resolves.toEqual({ id: 1, name: "test" });
  })

  it("should list items by field", async () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('oneValue'), ('oneValue'), ('anotherValue')");
    const promise = sqliteAdapter.getAllByField("test", { "name": "oneValue" });
    return expect(promise).resolves.toEqual([{ id: 1, name: "oneValue" }, { id: 2, name: "oneValue" }]);
  })

  it("should create an item", async () => {
    const promise = sqliteAdapter.create("test", { name: "newItem" });
    return expect(promise).resolves.toEqual({ id: 1, name: "newItem" });
  })

  it("should update an item", async () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('oldName')");

    const promise = sqliteAdapter.update("test", 1, { name: "updatedName" });

    return expect(promise).resolves.toEqual({ id: 1, name: "updatedName" });
  })

  it("should delete an item", async () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('toDelete')");

    await sqliteAdapter.delete("test", 1);

    const dbRes = database.prepare("SELECT * FROM __tests__").all();

    return expect(dbRes).toStrictEqual([]);
  })

  it("should delete an item by field", async () => {
    database.exec("INSERT INTO __tests__ (name) VALUES ('toDelete')");
    await sqliteAdapter.deleteByField("test", { "name": "toDelete" });

    const dbRes = database.prepare("SELECT * FROM __tests__").all();

    return expect(dbRes).toStrictEqual([]);
  })

  it("should allow run raw SQL code", async () => {
    const promise = sqliteAdapter.raw({ sql: "SELECT 1 + 1 AS result", params: [], isQuery: true });
    return expect(promise).resolves.toEqual({ result: 2 });
  })

  it("should allow create entity", async () => {
    const promise = sqliteAdapter.createEntity("newTable", { name: SchemaType.String });
    await expect(promise).resolves.toBeUndefined();

    const dbRes: any = database.prepare("SELECT * FROM sqlite_master WHERE type='table' AND name='newTable'").all();
    expect(dbRes[0]?.name).toStrictEqual('newTable');
  })

  it("should allow create entity twice without problem", async () => {
    await sqliteAdapter.createEntity("newTable", { name: SchemaType.String });
    const promise = sqliteAdapter.createEntity("newTable", { name: SchemaType.String });

    await expect(promise).resolves.toBeUndefined();
  })

  it("should register a create middleware", async () => {
    let middlewareValue = 0;
    const middleware = () => {
      middlewareValue += 1;
    }

    sqliteAdapter.registerCreateMiddleware(middleware);

    await sqliteAdapter.create("test", { name: "test" });

    expect(middlewareValue).toBe(1);
  })

  it("should not run create operation if any create middleware fail", async () => {
    const middleware = () => {
      throw new Error("error from middleware")
    }
    sqliteAdapter.registerCreateMiddleware(middleware);

    const promise = sqliteAdapter.create("test", { name: "test" });

    await expect(promise).rejects.toThrow("error from middleware");

    const dbRes = database.prepare("SELECT * FROM __tests__").all();
    expect(dbRes).toEqual([]);
  })

  it("should not run update operation if any update middleware fail", async () => {
    const middleware = () => {
      throw new Error("error from middleware")
    }
    sqliteAdapter.registerUpdateMiddleware(middleware);

    database.exec("INSERT INTO __tests__ (name) VALUES ('oldName')");

    const promise = sqliteAdapter.update("test", 1, { name: "newName" });

    await expect(promise).rejects.toThrow("error from middleware");

    const dbRes = database.prepare("SELECT * FROM __tests__").all();
    expect(dbRes).toEqual([{ id: 1, name: "oldName" }]);
  })

  it("should not run delete operation if any delete middleware fail", async () => {
    const middleware = () => {
      throw new Error("error from middleware")
    }
    sqliteAdapter.registerDeleteMiddleware(middleware);

    database.exec("INSERT INTO __tests__ (name) VALUES ('__tests__')");

    const promise = sqliteAdapter.delete("test", 1);

    await expect(promise).rejects.toThrow("error from middleware");

    const dbRes = database.prepare("SELECT * FROM __tests__").all();
    expect(dbRes).toEqual([{ id: 1, name: "test" }]);
  })

  it("should register a update middleware", async () => {
    let middlewareValue = 0;
    const middleware = () => {
      middlewareValue += 1;
    }

    sqliteAdapter.registerUpdateMiddleware(middleware);
    database.exec("INSERT INTO __tests__ (name) VALUES ('toUpdate')");

    await sqliteAdapter.update("test", 1, { name: "updated" });

    expect(middlewareValue).toBe(1);
  })

  it("should register a delete middleware", async () => {
    let middlewareValue = 0;
    const middleware = () => {
      middlewareValue += 1;
    }

    sqliteAdapter.registerDeleteMiddleware(middleware);
    database.exec("INSERT INTO __tests__ (name) VALUES ('toUpdate')");

    await sqliteAdapter.delete("test", 1);

    expect(middlewareValue).toBe(1);
  })
})