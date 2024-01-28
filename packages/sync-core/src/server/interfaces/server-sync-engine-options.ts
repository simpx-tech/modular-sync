import {ServerDomain} from "../server-domain";
import {DatabaseAdapter} from "../../interfaces/database-adapter";
import {RouterAdapter} from "./router-adapter";
import {AuthEngine} from "./auth-engine";

export interface ServerSyncEngineOptions {
  domains: ServerDomain[];
  metadataDatabase: DatabaseAdapter;
  routerAdapter: RouterAdapter;
  authEngine: AuthEngine;

  /**
   * Whether try to use mixed objects like in MongoDB when using separated fields storage
   * Only works if the database adapter supports it
   */
  tryNestedObjectsForFieldSeparatedStorage?: boolean;
}