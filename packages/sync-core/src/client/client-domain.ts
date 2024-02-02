import {ClientSyncEngineOptions} from "./interfaces/client-sync-engine-options";
import {DatabaseAdapter} from "../interfaces/database-adapter";
import {DiffEngine} from "./interfaces/diff-engine";
import {ClientSyncEngine} from "./client-sync-engine";

// TODO separate client from server (core-common + core-client/core-server)
export class ClientDomain {
  databaseAdapter: DatabaseAdapter;
  diffEngine: DiffEngine;
  syncEngine: ClientSyncEngine;
  prefix: string;

  constructor({ databaseAdapter, diffEngine, prefix }: ClientSyncEngineOptions) {
    this.databaseAdapter = databaseAdapter;
    this.diffEngine = diffEngine;
    this.prefix = prefix;
  }

  async runSetup(syncEngine: ClientSyncEngine) {
    this.syncEngine = syncEngine;
    await this.databaseAdapter.connect();
    await this.diffEngine.runSetup(this);
  }
}