import {RepositoryFactory} from "./repository-factory";
import {SchemaType} from "../interfaces/database-adapter";
import {setupTests} from "../../__tests__/helpers/setup-tests";
import {ServerSyncEngine} from "../server/server-sync-engine";
import {ServerDomain} from "../server/server-domain";

describe("RepositoryFactory", () => {
  let syncEngine: ServerSyncEngine;
  let domain: ServerDomain;

  beforeEach(async () => {
    ({ syncEngine, domain } = setupTests());
  })

  describe("create", () => {
    it("should create the repository and correctly convert data", async () => {
      const repository = RepositoryFactory.create("test_entity_999", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      domain.repositories.push(repository);
      await syncEngine.runSetup();

      const res = await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      expect(res).toEqual({
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
        changedAt: null,
        createdAt: null,
        creationUUID: null,
        deletedAt: null,
        domain: null,
        submittedAt: null,
        wasDeleted: false
      })
    })

    it("should create a repository with a connection field", async () => {
      const repository = RepositoryFactory.create("test_entity999", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      });

      const repository2 = RepositoryFactory.create("test_entity998", {
        test5: SchemaType.Connection("test_entity999"),
      } as const)

      domain.repositories.push(repository);
      domain.repositories.push(repository2);
      await syncEngine.runSetup();

      const res = await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const res2 = await repository2.create({
        test5: 1,
      })

      expect(res).toEqual({
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
        changedAt: null,
        createdAt: null,
        creationUUID: null,
        deletedAt: null,
        domain: null,
        submittedAt: null,
        wasDeleted: false
      })

      expect(res2).toEqual({
        id: 1,
        test5: 1,
        changedAt: null,
        createdAt: null,
        creationUUID: null,
        deletedAt: null,
        domain: null,
        submittedAt: null,
        wasDeleted: false
      })
    })

    it("should not add sync fields if asked", async () => {
      const repository = RepositoryFactory.create("test_entity_999", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      }, { isToIgnoreSyncFields: true });

      domain.repositories.push(repository);
      await syncEngine.runSetup();

      const res = await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      expect(res).toEqual({
        id: 1,
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })
    })

    it("should create unique fields if asked", async () => {
      const repository = RepositoryFactory.create("test_entity_999", {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
        test4: SchemaType.Date,
      }, { unique: ["test"] });

      domain.repositories.push(repository);
      await syncEngine.runSetup();

      await repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      const promise = repository.create({
        test: "test",
        test2: 1,
        test3: true,
        test4: new Date("2021-01-01"),
      })

      await expect(promise).rejects.toEqual(new Error("UNIQUE constraint failed: test_entity_999.test"));
    })
  })
})