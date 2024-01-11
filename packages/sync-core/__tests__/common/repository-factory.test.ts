import {RepositoryFactory} from "../../src/common/repository-factory";
import {SchemaType} from "../../src/interfaces/database-adapter";
import {setupTests} from "../helpers/setup-tests";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {ServerDomain} from "../../src/server/server-domain";

describe("RepositoryFactory", () => {
  let syncEngine: ServerSyncEngine;
  let commonDb: SqliteAdapter;
  let domain: ServerDomain;

  beforeEach(async () => {
    ({ syncEngine, commonDb, domain } = setupTests());
    await commonDb.connect();
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
      await domain.runSetup(syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

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
      await domain.runSetup(syncEngine);

      // Run migrations automatically created from repositories
      await syncEngine.migrationRunner.runSetup();
      await syncEngine.migrationRunner.runAllMigrations();

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
      })

      expect(res2).toEqual({
        id: 1,
        test5: 1,
      })
    })
  })
})