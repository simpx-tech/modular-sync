import {ServerSyncEngine} from "../server/server-sync-engine";
import {setupTests} from "../../__tests__/helpers/setup-tests";
import {RepositoryBase} from "./repository-base";
import {SchemaType} from "../interfaces/database-adapter";
import {REPOSITORY_ENTITY} from "../repositories/repository/repository-repository-constants";
import {DOMAIN_ENTITY} from "../repositories/domain/domain-repository-constants";

describe("Repository", () => {
  let syncEngine: ServerSyncEngine;
  let repositoryWithUnique: RepositoryBase<any>;
  let repositoryWithUniqueNoMetadata: RepositoryBase<any>;

  beforeEach(async () => {
    ({ syncEngine, repositoryWithUnique, repositoryWithUniqueNoMetadata } = setupTests());
    await syncEngine.runSetup()
  })

  it("should add metadata to the schema", () => {
    expect(repositoryWithUnique.schema).toEqual({
      test: SchemaType.String,
      test2: SchemaType.Integer,
      test3: SchemaType.Boolean,
      test4: SchemaType.Date,
      domain: SchemaType.Connection(DOMAIN_ENTITY),
      creationUUID: SchemaType.String,
      createdAt: SchemaType.Date,
      submittedAt: SchemaType.Date,
      deletedAt: SchemaType.Date,
      changedAt: SchemaType.Date,
      wasDeleted: SchemaType.Boolean,
    })
  })

  describe("create", () => {
    it("should create and convert data types properly", async () => {
      const res = await repositoryWithUniqueNoMetadata.create({
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
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repositoryWithUniqueNoMetadata.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repositoryWithUniqueNoMetadata.getFirst();

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
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repositoryWithUniqueNoMetadata.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repositoryWithUniqueNoMetadata.getById(2);

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

      await repositoryWithUniqueNoMetadata.create(first)
      await repositoryWithUniqueNoMetadata.create(second)

      const res = await repositoryWithUniqueNoMetadata.getByField({ test: "test2" });
      const res2 = await repositoryWithUniqueNoMetadata.getByField({ test2: 1 });
      const res3 = await repositoryWithUniqueNoMetadata.getByField({ test3: false });
      const res4 = await repositoryWithUniqueNoMetadata.getByField({ test4: new Date("2021-01-01") });

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
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repositoryWithUniqueNoMetadata.create({
        test: "test2",
        test2: 1,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repositoryWithUniqueNoMetadata.getAllByField({ test2: 1 });

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
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repositoryWithUniqueNoMetadata.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const res = await repositoryWithUniqueNoMetadata.getAll();

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
      await repositoryWithUniqueNoMetadata.createIfNotExists(["test"], {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repositoryWithUniqueNoMetadata.createIfNotExists(["test"], {
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const res = await repositoryWithUniqueNoMetadata.getAll();

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
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const updated = await repositoryWithUniqueNoMetadata.update(1, {
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

      const all = await repositoryWithUniqueNoMetadata.getAll();

      expect(all).toEqual([{
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      }])
    });
  })

  describe("upsert", () => {
    it("should upsert, update if the entity exists", async () => {
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const updated = await repositoryWithUniqueNoMetadata.upsert({ test: "test" }, {
        test: "testUpdated",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      expect(updated).toEqual({
        id: 1,
        test: "testUpdated",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      });

      const all = await repositoryWithUniqueNoMetadata.getAll();

      expect(all).toEqual([{
        id: 1,
        test: "testUpdated",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      }])
    });

    it("should upsert, create if the entity doesn't exists", async () => {
      const updated = await repositoryWithUniqueNoMetadata.upsert({ test: "test" }, {
        test: "testUpdated",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      expect(updated).toEqual({
        id: 1,
        test: "testUpdated",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      });

      const all = await repositoryWithUniqueNoMetadata.getAll();

      expect(all).toEqual([{
        id: 1,
        test: "testUpdated",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      }])
    });
  })

  describe("delete", () => {
    it("should delete", async () => {
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const wasDeleted = await repositoryWithUniqueNoMetadata.delete(1)
      expect(wasDeleted).toEqual({
        wasDeleted: true,
      });

      const all = await repositoryWithUniqueNoMetadata.getAll();
      expect(all).toEqual([])
    });
  })

  describe("deleteByField", () => {
    it("should delete based on provided keys", async () => {
      await repositoryWithUniqueNoMetadata.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await repositoryWithUniqueNoMetadata.create({
        test: "test2",
        test2: 2,
        test3: false,
        test4: new Date("2021-01-02"),
      })

      const wasDeleted = await repositoryWithUniqueNoMetadata.deleteByField({ test: "test2" })
      expect(wasDeleted).toEqual({
        wasDeleted: true,
      });

      const all = await repositoryWithUniqueNoMetadata.getAll();
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
