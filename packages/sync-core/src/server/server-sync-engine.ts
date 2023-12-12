import {DatabaseAdapter} from "../interfaces/database-adapter";
import {MergeEngine} from "../interfaces/merge-engine";
import {AuthEngine} from "../interfaces/auth-engine";
import {RouterAdapter} from "../interfaces/router-adapter";
import {ServerSyncEngineOptions} from "../interfaces/server-sync-engine-options";
import {HttpMethod} from "../interfaces/http-method";
import {RouterRequest} from "../interfaces/router-callback";

export class ServerSyncEngine {
  databaseAdapter: DatabaseAdapter;
  mergeEngine: MergeEngine;
  authEngine: AuthEngine;
  routerAdapter: RouterAdapter;

  constructor({ databaseAdapter, mergeEngine, authEngine, routerAdapter }: ServerSyncEngineOptions) {
    this.databaseAdapter = databaseAdapter;
    this.mergeEngine = mergeEngine;
    this.authEngine = authEngine;
    this.routerAdapter = routerAdapter;
  }

  async runSetup() {
    await this.databaseAdapter.connect();
    await this.authEngine.runSetup(this);
    await this.mergeEngine.runSetup(this);
    this.routerAdapter.registerRoute(HttpMethod.GET, "repository", this.getRepository.bind(this));
  }

  async getRepository (request: RouterRequest) {}
}