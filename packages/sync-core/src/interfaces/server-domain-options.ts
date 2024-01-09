import {DatabaseAdapter} from "./database-adapter";
import {MergeEngine} from "../server/interfaces/merge-engine";
import {FieldStorageMethod} from "../server/enums/field-storage-method";
import {RepositoryBase} from "../common/repository-base";

export interface ServerDomainOptions {
  databaseAdapter: DatabaseAdapter;
  mergeEngine: MergeEngine;
  name: string;
  fieldsStorageMethod: FieldStorageMethod;
  repositories?: RepositoryBase<any>[];
}