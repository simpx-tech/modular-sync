import {ClientSyncEngine} from "@simpx/sync-core/src";
import {
  IncrementalModificationsEngine
} from "@simpx/sync-incremental-modifications-engine/src/incremental-modifications-engine";
import {SqliteAdapter} from "@simpx/sync-sqlite-adapter";

async function frontend() {
  const syncEngine = new ClientSyncEngine({
    modificationsEngine: new IncrementalModificationsEngine({ remoteSyncEndpoint: "http://localhost:3000/sync" }),
    databaseAdapter: new SqliteAdapter({ databasePath: "./db.sqlite" })
  })

  await syncEngine.runSetup();
  const database = syncEngine.databaseAdapter;

  await database.create("users", { name: "John Doe", age: 30 });
}

frontend();