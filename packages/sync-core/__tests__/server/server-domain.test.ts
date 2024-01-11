import {ServerDomain} from "../../src/server/server-domain";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";
import {DatabaseMerger} from "@simpx/sync-database-merger/src/sync-database-merger";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import {setupTests} from "../helpers/setup-tests";

describe("Server Domain", () => {
  let domain: ServerDomain;
  let mergeEngine: DatabaseMerger;
  let databaseAdapter: SqliteAdapter;
  let syncEngine: ServerSyncEngine;

  beforeEach(() => {
    ({ domain, syncEngine } = setupTests());

    mergeEngine = domain.mergeEngine as DatabaseMerger;
    mergeEngine.runSetup = jest.fn().mockResolvedValue(undefined);

    databaseAdapter = domain.databaseAdapter as SqliteAdapter;
    databaseAdapter.connect = jest.fn().mockResolvedValue(undefined);
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