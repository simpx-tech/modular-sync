import {RepositoryFactory} from "../../src/common/repository-factory";
import {SchemaType} from "../../src/interfaces/database-adapter";
import {setupTests} from "../helpers/setup-tests";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {ServerDomain} from "../../src/server/server-domain";

describe("RepositoryFactory", () => {
  let syncEngine: ServerSyncEngine;
  let commonDb: SqliteAdapter;
  let domain: ServerDomain

  beforeEach(() => {
    ({ syncEngine, commonDb, domain } = setupTests());
  })

  describe("create", () => {
    it("should create a repository", async () => {
      const repository = RepositoryFactory.create("test_entity", domain, {
        test: SchemaType.String,
        test2: SchemaType.Integer,
        test3: SchemaType.Boolean,
      });

      await repository.runSetup(syncEngine);

      const res = await repository.create({});
      res.test
      res.test2
      res.test3
    })
  })
})