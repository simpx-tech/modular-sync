import {DatabaseAdapter} from "./database-adapter";
import {DiffEngine} from "./diff-engine";

export interface ClientSyncEngineOptions {
  databaseAdapter: DatabaseAdapter;
  diffEngine: DiffEngine;
  repositoryName: string;
}