import {IncrementalModificationsEngineOptions} from "./interfaces/incremental-modifications-engine-options";
import {ClientSyncEngine} from "@simpx/sync-core/src";
import {ModificationsEngine} from "@simpx/sync-core/src/interfaces/modifications-engine";
import {UpsertData} from "@simpx/sync-core/src/interfaces/database-adapter";

export class IncrementalModificationsEngine implements ModificationsEngine {
  private readonly remoteSyncEndpoint: string;

  constructor({ remoteSyncEndpoint }: IncrementalModificationsEngineOptions) {
    this.remoteSyncEndpoint = remoteSyncEndpoint;
  }

  async runSetup(syncEngine: ClientSyncEngine) {
    syncEngine.databaseAdapter.registerCreateMiddleware(this.onDatabaseCreate.bind(this));
    syncEngine.databaseAdapter.registerUpdateMiddleware(this.onDatabaseUpdate.bind(this));
    syncEngine.databaseAdapter.registerDeleteMiddleware(this.onDatabaseDelete.bind(this));
  }

  private async onDatabaseCreate(entity: string, data: UpsertData) {

  }

  private async onDatabaseUpdate() {

  }

  private async onDatabaseDelete() {

  }

  // TODO Time based (periodic or after certain time without doing changes) or quantity based?
  // TODO Anyway should always mark files as dirty when they are modified (should be the first thing, before the modification)

  async submitModifications(){
    try {
      const res = await fetch(this.remoteSyncEndpoint);
    } catch (err) {
      // ...
    }
  }
};