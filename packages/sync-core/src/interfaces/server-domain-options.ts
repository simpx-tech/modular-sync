import {DatabaseAdapter} from "./database-adapter";
import {MergeEngine} from "../server/interfaces/merge-engine";
import {DynamicFieldsStrategy} from "../server/enums/dynamic-fields-strategy";
import {RepositoryBase} from "../common/repository-base";

export interface ServerDomainOptions {
  databaseAdapter: DatabaseAdapter;
  mergeEngine: MergeEngine;
  name: string;

  dynamicFieldsStrategy?: DynamicFieldsStrategy;
  repositories?: RepositoryBase<any, any, any, any>[];

  /* Doesn't create domain entity on the database */
  isVirtual?: boolean;
}