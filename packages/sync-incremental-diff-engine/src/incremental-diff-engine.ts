import {IncrementalDiffEngineOptions} from "./interfaces/incremental-diff-engine-options";
import {ClientSyncEngine} from "@simpx/sync-core/src";
import {DiffEngine} from "@simpx/sync-core/src/interfaces/diff-engine";
import {UpsertData} from "@simpx/sync-core/src/interfaces/database-adapter";

export class IncrementalDiffEngine implements DiffEngine {
  private readonly remoteSyncEndpoint: string;

  constructor({ remoteSyncEndpoint }: IncrementalDiffEngineOptions) {
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

  fetchAll(): Promise<void> {
    return Promise.resolve(undefined);
  }

  sendAll(): Promise<void> {
    return Promise.resolve(undefined);
  }

  sync(): Promise<void> {
    return Promise.resolve(undefined);
  }
};