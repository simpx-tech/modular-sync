import {ServerDomain} from "../../src/server/server-domain";
import {MockMergeEngine} from "../mocks/mock-merge-engine";
import {MockDatabaseAdapter} from "../mocks/mock-database-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {MockRouterAdapter} from "../mocks/mock-router-adapter";
import {MockAuthEngine} from "../mocks/mock-auth-engine";
import {FieldStorageMethod} from "../../src/server/enums/field-storage-method";
import {DatabaseMerger} from "@simpx/sync-database-merger/src/sync-database-merger";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";

describe("Server Domain", () => {
  let domain: ServerDomain;
  let mergeEngine: DatabaseMerger;
  let databaseAdapter: SqliteAdapter;
  let syncEngine: ServerSyncEngine;

  beforeEach(() => {
    mergeEngine = new DatabaseMerger();
    mergeEngine.runSetup = jest.fn().mockResolvedValue(undefined);

    databaseAdapter = new SqliteAdapter();
    databaseAdapter.connect = jest.fn().mockResolvedValue(undefined);

    domain = new ServerDomain({
      mergeEngine,
      databaseAdapter,
      fieldsStorageMethod: FieldStorageMethod.Unified,
      name: "test-domain"
    });

    syncEngine = new ServerSyncEngine({
      domains: [domain],
      authEngine: new MockAuthEngine(),
      routerAdapter: new MockRouterAdapter(),
      metadataDatabase: new MockDatabaseAdapter(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe("runSetup", () => {
    it("should connect to the database and run the mergeEngine helpers", async () => {
      await domain.runSetup(syncEngine);

      expect(mergeEngine.runSetup).toHaveBeenCalledTimes(1);
      expect(databaseAdapter.connect).toHaveBeenCalledTimes(1);
    })
  })
})