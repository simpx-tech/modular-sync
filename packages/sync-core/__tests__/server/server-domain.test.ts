import {ServerDomain} from "../../src/server/server-domain";
import {MockMergeEngine} from "../mocks/mock-merge-engine";
import {MockDatabaseAdapter} from "../mocks/mock-database-adapter";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {MockRouterAdapter} from "../mocks/mock-router-adapter";
import {MockAuthEngine} from "../mocks/mock-auth-engine";

describe("Server Domain", () => {
  let domain: ServerDomain;
  let mergeEngine: MockMergeEngine;
  let databaseAdapter: MockDatabaseAdapter;
  let syncEngine: ServerSyncEngine;

  beforeEach(() => {
    mergeEngine = new MockMergeEngine();
    mergeEngine.runSetup = jest.fn().mockResolvedValue(undefined);

    databaseAdapter = new MockDatabaseAdapter();
    databaseAdapter.connect = jest.fn().mockResolvedValue(undefined);

    domain = new ServerDomain({
      mergeEngine,
      databaseAdapter,
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