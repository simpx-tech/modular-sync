import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {setupTests} from "../helpers/setup-tests";
import {RepositoryBase} from "../../src/common/repository-base";
import {SchemaType} from "../../src/interfaces/database-adapter";
import {REPOSITORY_ENTITY} from "../../src/repositories/repository/repository-repository-constants";
import {DOMAIN_ENTITY} from "../../src/repositories/domain/domain-repository-constants";

describe("Repository", () => {
  let syncEngine: ServerSyncEngine;
  let test3Repository: RepositoryBase<any>;

  beforeEach(async () => {
    ({ syncEngine, test3Repository } = setupTests());
    await syncEngine.runSetup()
  })

  it("should add metadata to the schema", () => {
    expect(test3Repository.schema).toEqual({
      test: SchemaType.String,
      test2: SchemaType.Integer,
      test3: SchemaType.Boolean,
      test4: SchemaType.Date,
      repository: SchemaType.Connection(REPOSITORY_ENTITY),
      domain: SchemaType.Connection(DOMAIN_ENTITY),
      createdAt: SchemaType.Date,
      submittedAt: SchemaType.Date,
      updatedAt: SchemaType.Date,
      wasDeleted: SchemaType.Boolean,
    })
  })

  describe("create", () => {
    it("should create and convert data types properly", async () => {
      const res = await test3Repository.create({
        test: "test",
        test2: 1,
        test3: false,
        test4: new Date("2021-01-01"),
      })

      expect(res).toEqual({
        id: 1,
        test: "test",
        test2: 1,
        test3: false,
        test4: new Date("2021-01-01"),
      })
    });
  })

  describe("getFirst", () => {
    it("should get first and convert data types properly", async () => {
      await test3Repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await test3Repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await test3Repository.getFirst();

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
      await test3Repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await test3Repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await test3Repository.getById(2);

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

      await test3Repository.create(first)
      await test3Repository.create(second)

      const res = await test3Repository.getByField({ test: "test2" });
      const res2 = await test3Repository.getByField({ test2: 1 });
      const res3 = await test3Repository.getByField({ test3: false });
      const res4 = await test3Repository.getByField({ test4: new Date("2021-01-01") });

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
      await test3Repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await test3Repository.create({
        test: "test2",
        test2: 1,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await test3Repository.getAllByField({ test2: 1 });

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
      await test3Repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await test3Repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await test3Repository.getAll();

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
      await test3Repository.createIfNotExists(["test"], {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await test3Repository.createIfNotExists(["test"], {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const res = await test3Repository.getAll();

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
      await test3Repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const updated = await test3Repository.update(1, {
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

      const all = await test3Repository.getAll();

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
      await test3Repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const wasDeleted = await test3Repository.delete(1)
      expect(wasDeleted).toEqual({
        wasDeleted: true,
      });

      const all = await test3Repository.getAll();
      expect(all).toEqual([])
    });
  })

  describe("deleteByField", () => {
    it("should delete based on provided keys", async () => {
      await test3Repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await test3Repository.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const wasDeleted = await test3Repository.deleteByField({ test: "test2" })
      expect(wasDeleted).toEqual({
        wasDeleted: true,
      });

      const all = await test3Repository.getAll();
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
