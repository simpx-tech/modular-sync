import {ClientSyncEngine} from "@simpx/sync-core/src";
import {
  IncrementalModificationsEngine
} from "@simpx/sync-incremental-modifications-engine/src/incremental-modifications-engine";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import fs from "fs";

describe("E2E Tests", () => {
  it("should create a database file at startup with SQLiteAdapter", async () => {
    const syncEngine = new ClientSyncEngine({
      modificationsEngine: new IncrementalModificationsEngine({ remoteSyncEndpoint: "http://localhost:3000/sync" }),
      databaseAdapter: new SqliteAdapter({ databasePath: "./tmp/test.sqlite" })
    })

    await syncEngine.runSetup();

    const hasFile = fs.existsSync("./tmp/test.sqlite");
    expect(hasFile).toBe(true);
  })
})