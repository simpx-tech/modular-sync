import {DatabaseAdapter} from "./database-adapter";
import {MergeEngine} from "../server/interfaces/merge-engine";

export interface ServerDomainOptions {
  databaseAdapter: DatabaseAdapter;
  mergeEngine: MergeEngine;
  name: string;
}