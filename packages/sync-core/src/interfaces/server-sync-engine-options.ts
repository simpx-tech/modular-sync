import {DatabaseAdapter} from "./database-adapter";
import {MergeEngine} from "./merge-engine";
import {AuthEngine} from "./auth-engine";
import {RouterAdapter} from "./router-adapter";

export interface ServerSyncEngineOptions {
  databaseAdapter: DatabaseAdapter;
  mergeEngine: MergeEngine;
  authEngine: AuthEngine;
  routerAdapter: RouterAdapter;
}