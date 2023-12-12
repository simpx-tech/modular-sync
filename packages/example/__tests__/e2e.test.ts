import {ClientSyncEngine} from "@simpx/sync-core/src";
import {
  IncrementalDiffEngine
} from "@simpx/sync-incremental-diff-engine/src/incremental-diff-engine";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";
import fs from "fs";

describe("E2E Tests", () => {
  it("should create a database file at startup with SQLiteAdapter", async () => {
    const syncEngine = new ClientSyncEngine({
      diffEngine: new IncrementalDiffEngine({ remoteSyncEndpoint: "http://localhost:3000/sync" }),
      databaseAdapter: new SqliteAdapter({ databasePath: "./tmp/test.sqlite" })
    })

    await syncEngine.runSetup();

    const hasFile = fs.existsSync("./tmp/test.sqlite");
    expect(hasFile).toBe(true);
  })
})