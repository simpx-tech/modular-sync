import {DatabaseAdapter} from "../interfaces/database-adapter";
import {MergeEngine} from "./interfaces/merge-engine";
import {ServerDomainOptions} from "../interfaces/server-domain-options";
import {ServerSyncEngine} from "./server-sync-engine";

export class ServerDomain {
  readonly databaseAdapter: DatabaseAdapter;
  readonly mergeEngine: MergeEngine;
  readonly name: string;

  syncEngine: ServerSyncEngine;

  constructor({
    databaseAdapter,
    mergeEngine,
    name,
  }: ServerDomainOptions) {
    this.databaseAdapter = databaseAdapter;
    this.mergeEngine = mergeEngine;
    this.name = name;
  }

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;

    await this.databaseAdapter.connect();
    await this.mergeEngine.runSetup(this.syncEngine);
  }
}