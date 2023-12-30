import {MergeEngine} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";

export class DatabaseMerger implements MergeEngine {
  private syncEngine: ServerSyncEngine;

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;

    this.syncEngine.domains.forEach(domain => {
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/sync`, this.sync.bind(this));
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/bulk-read`, this.sendAll.bind(this));
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/bulk-write`, this.receiveAll.bind(this));
    })
  }

  async sync() {}

  async receiveAll() {}

  async sendAll() {}
}