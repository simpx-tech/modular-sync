import {ServerDomain} from "../server-domain";
import {DatabaseAdapter} from "../../interfaces/database-adapter";
import {RouterAdapter} from "./router-adapter";
import {AuthEngine} from "./auth-engine";

export interface ServerSyncEngineOptions {
  domains: ServerDomain[];
  metadataDatabase: DatabaseAdapter;
  routerAdapter: RouterAdapter;
  authEngine: AuthEngine;
}