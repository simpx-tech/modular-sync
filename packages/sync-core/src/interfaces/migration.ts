import {DatabaseAdapter} from "./database-adapter";

export interface Migration {
  /**
   * A way to organize migrations into groups. For example, you can have a migration that runs once per domain.
   */
  domain?: string;

  /**
   * If you don't want to make the Migration class name the migration name then set this property instead
   */
  customName?: string;

  runOnEntity?: string;

  runOnce?: (db: DatabaseAdapter) => Promise<void>;

  // TODO
  // runPerEntity?: (db: DatabaseAdapter, entity: any) => Promise<void>;
  // runPerField?: (db: DatabaseAdapter, entity: any, field: any) => Promise<void>;
}

export interface DatabaseAdapterOptions {
  dbAdapter: DatabaseAdapter;
}