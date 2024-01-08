import {DatabaseAdapter} from "./database-adapter";

export interface Migration {
  runOnEntity?: string;

  runOnce?: (db: DatabaseAdapter) => Promise<void>;

  // TODO
  // runPerEntity?: (db: DatabaseAdapter, entity: any) => Promise<void>;
  // runPerField?: (db: DatabaseAdapter, entity: any, field: any) => Promise<void>;
}

export interface DatabaseAdapterOptions {
  dbAdapter: DatabaseAdapter;
}