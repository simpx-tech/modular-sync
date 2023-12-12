import {DatabaseAdapter} from "./database-adapter";
import {ModificationsEngine} from "./modifications-engine";

export interface ClientSyncEngineOptions {
  databaseAdapter: DatabaseAdapter;
  modificationsEngine: ModificationsEngine;
  repositoryName: string;
}