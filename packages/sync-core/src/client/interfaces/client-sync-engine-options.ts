import {DatabaseAdapter} from "../../interfaces/database-adapter";
import {DiffEngine} from "./diff-engine";

export interface ClientSyncEngineOptions {
  databaseAdapter: DatabaseAdapter;
  diffEngine: DiffEngine;
  prefix: string;
}