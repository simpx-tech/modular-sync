import {SqliteAdapter} from "./sqlite-adapter";
import * as fs from "fs";
import BetterSqlite, {Database} from "better-sqlite3";
import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";
import crypto from "crypto";
import path from "path";
import {__createTmpDirIfNotExists} from "@simpx/sync-core/__tests__/helpers/setup-tests";
import * as os from "os";

describe("SQLite Adapter", () => {
  let sqliteAdapter: SqliteAdapter = null;
  let database: Database = null;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = `${crypto.randomUUID()}.db`;

    __createTmpDirIfNotExists();

    sqliteAdapter = new SqliteAdapter({ databasePath: path.join(os.tmpdir(), "modular-sync-tmp", dbPath) });
    await sqliteAdapter.connect();

    database = new BetterSqlite(path.join(__dirname, "./data", dbPath));
    database.exec("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
    database.exec("CREATE TABLE IF NOT EXISTS test2 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, table_id INTEGER, FOREIGN KEY(table_id) REFERENCES test(id))");
    database.exec("CREATE TABLE IF NOT EXISTS test3 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, name2 TEXT, UNIQUE(name, name2))");
    database.exec("CREATE TABLE IF NOT EXISTS test4 (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, name2 TEXT)");
  })

  afterEach(async () => {
    await sqliteAdapter.disconnect();
    fs.unlinkSync(path.join(__dirname, "./data", dbPath));
  })

  describe("createIfNotExists", () => {
    it("should create and return the item if it not exists", async () => {
      const created = await sqliteAdapter.createIfNotExists("test3", ["name", "name2"], { name: "newItem", name2: "newItem2" });

      return expect(created).toEqual({ id: 1, name: "newItem", name2: "newItem2" });
    })

    it("should not duplicate and return the item if it already exists", async () => {
      database.exec("INSERT INTO test3 (name, name2) VALUES ('newItem', 'newItem2')");
      const created = await sqliteAdapter.createIfNotExists("test3", ["name", "name2"], { name: "newItem", name2: "newItem2" });

      return expect(created).toEqual({ id: 1, name: "newItem", name2: "newItem2" });
    })
  })

  it("should get the first item from a table", () => {
    database.exec("INSERT INTO test (name) VALUES ('test'), ('test2'), ('test3')");

    const promise = sqliteAdapter.getFirst("test");

    return expect(promise).resolves.toEqual({ id: 1, name: "test" });
  })

  it("should get the an item by id", () => {
    database.exec("INSERT INTO test (name) VALUES ('test'), ('test2'), ('test3')");

    const promise = sqliteAdapter.getById("test", 2);

    return expect(promise).resolves.toEqual({ id: 2, name: "test2" });
  })

  it("should list all items from a tests", () => {
    database.exec("INSERT INTO test (name) VALUES ('test'), ('test2'), ('test3')");

    const promise = sqliteAdapter.getAll("test");

    return expect(promise).resolves.toEqual([{ id: 1, name: "test" }, { id: 2, name: "test2" }, { id: 3, name: "test3" }]);
  })

  it("should get an item by field", async () => {
    database.exec("INSERT INTO test (name) VALUES ('test')");
    const promise = sqliteAdapter.getByField("test", { name: "test" });
    return expect(promise).resolves.toEqual({ id: 1, name: "test" });
  })

  it("should list items by field", async () => {
    database.exec("INSERT INTO test (name) VALUES ('oneValue'), ('oneValue'), ('anotherValue')");
    const promise = sqliteAdapter.getAllByField("test", { "name": "oneValue" });
    return expect(promise).resolves.toEqual([{ id: 1, name: "oneValue" }, { id: 2, name: "oneValue" }]);
  })

  it("should create an item", async () => {
    const promise = sqliteAdapter.create("test", { name: "newItem" });
    return expect(promise).resolves.toEqual({ id: 1, name: "newItem" });
  })

  it("should update an item", async () => {
    database.exec("INSERT INTO test (name) VALUES ('oldName')");

    const promise = sqliteAdapter.update("test", 1, { name: "updatedName" });

    return expect(promise).resolves.toEqual({ id: 1, name: "updatedName" });
  })

  it("should upsert, update if the data already exists", async () => {
    database.exec("INSERT INTO test4 (name, name2) VALUES ('name', 'name2')");

    const promise = sqliteAdapter.upsert("test4", { name: "name" }, { name: "updatedName" });

    await expect(promise).resolves.toEqual({ id: 1, name: "updatedName", name2: "name2" });
    const dbRes = database.prepare("SELECT * FROM test4").all();
    expect(dbRes).toHaveLength(1);
  })

  it("should upsert, create if data doesn't exists", async () => {
    const promise = sqliteAdapter.upsert("test4", { name: "name" }, { name: "updatedName", name2: "name2" });

    await expect(promise).resolves.toEqual({ id: 1, name: "updatedName", name2: "name2" });
    const dbRes = database.prepare("SELECT * FROM test4").all();
    expect(dbRes).toHaveLength(1);
  })

  it("should delete an item", async () => {
    database.exec("INSERT INTO test (name) VALUES ('toDelete')");

    await sqliteAdapter.delete("test", 1);

    const dbRes = database.prepare("SELECT * FROM test").all();

    return expect(dbRes).toStrictEqual([]);
  })

  it("should delete an item by field", async () => {
    database.exec("INSERT INTO test (name) VALUES ('toDelete')");
    await sqliteAdapter.deleteByField("test", { "name": "toDelete" });

    const dbRes = database.prepare("SELECT * FROM test").all();

    return expect(dbRes).toStrictEqual([]);
  })

  it("should allow run raw SQL code", async () => {
    const promise = sqliteAdapter.raw({ sql: "SELECT 1 + 1 AS result", params: [], isQuery: true });
    return expect(promise).resolves.toEqual({ result: 2 });
  })

  describe("createEntity", () => {
    it("should allow create entity", async () => {
      const promise = sqliteAdapter.createEntity("newTable", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Float,
        test4: SchemaType.Boolean,
        test5: SchemaType.Date,
        test6: SchemaType.Id,
        test7: SchemaType.Connection("test"),
        test8: SchemaType.Json,
      })
      await expect(promise).resolves.toBeUndefined();

      const dbRes: any = database.prepare("SELECT * FROM sqlite_master WHERE type='table' AND name='newTable'").all();
      expect(dbRes[0]?.name).toStrictEqual('newTable');
    })

    it("should allow create entity twice without problem", async () => {
      await sqliteAdapter.createEntity("newTable", { name: SchemaType.String });
      const promise = sqliteAdapter.createEntity("newTable", { name: SchemaType.String });

      await expect(promise).resolves.toBeUndefined();
    })

    it("should create unique fields constraint properly", async () => {
      await sqliteAdapter.createEntity("newTable", { name: SchemaType.String }, { unique: ["name"] });

      await sqliteAdapter.create("newTable", { name: "test" });
      const promise = sqliteAdapter.create("newTable", { name: "test" });

      await expect(promise).rejects.toThrow();
    })

    it("should create compound unique fields constraint properly", async () => {
      await sqliteAdapter.createEntity("newTable", { name: SchemaType.String, name2: SchemaType.String }, { unique: ["name", "name2"] });

      await sqliteAdapter.create("newTable", { name: "test", name2: "test2" });
      await sqliteAdapter.create("newTable", { name: "test", name2: "test3" }); // Should not throw
      await sqliteAdapter.create("newTable", { name: "test3", name2: "test2" }); // Should not throw

      const promise = sqliteAdapter.create("newTable", { name: "test", name2: "test2" }); // Should throw

      await expect(promise).rejects.toThrow();
    })
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

    const dbRes = database.prepare("SELECT * FROM test").all();
    expect(dbRes).toEqual([]);
  })

  it("should not run update operation if any update middleware fail", async () => {
    const middleware = () => {
      throw new Error("error from middleware")
    }
    sqliteAdapter.registerUpdateMiddleware(middleware);

    database.exec("INSERT INTO test (name) VALUES ('oldName')");

    const promise = sqliteAdapter.update("test", 1, { name: "newName" });

    await expect(promise).rejects.toThrow("error from middleware");

    const dbRes = database.prepare("SELECT * FROM test").all();
    expect(dbRes).toEqual([{ id: 1, name: "oldName" }]);
  })

  it("should not run delete operation if any delete middleware fail", async () => {
    const middleware = () => {
      throw new Error("error from middleware")
    }
    sqliteAdapter.registerDeleteMiddleware(middleware);

    database.exec("INSERT INTO test (name) VALUES ('test')");

    const promise = sqliteAdapter.delete("test", 1);

    await expect(promise).rejects.toThrow("error from middleware");

    const dbRes = database.prepare("SELECT * FROM test").all();
    expect(dbRes).toEqual([{ id: 1, name: "test" }]);
  })

  it("should register a update middleware", async () => {
    let middlewareValue = 0;
    const middleware = () => {
      middlewareValue += 1;
    }

    sqliteAdapter.registerUpdateMiddleware(middleware);
    database.exec("INSERT INTO test (name) VALUES ('toUpdate')");

    await sqliteAdapter.update("test", 1, { name: "updated" });

    expect(middlewareValue).toBe(1);
  })

  it("should register a delete middleware", async () => {
    let middlewareValue = 0;
    const middleware = () => {
      middlewareValue += 1;
    }

    sqliteAdapter.registerDeleteMiddleware(middleware);
    database.exec("INSERT INTO test (name) VALUES ('toUpdate')");

    await sqliteAdapter.delete("test", 1);

    expect(middlewareValue).toBe(1);
  })
})