import {ServerSyncEngine} from "../server-sync-engine";

export interface MergeEngine {
  runSetup(syncEngine: ServerSyncEngine): Promise<void>;
  sync(identity: Identity, operation: SyncOperation): Promise<OperationsReturn>;
  bulkWrite(identity: Identity, operation: BulkWriteOperation): Promise<OperationsReturn>;
  bulkRead(identity: Identity, options: BulkReadOptions): Promise<OperationsReturn>;
}

export interface Identity {
  domain: string;
  repositoryId: string | number;
}

export interface BulkWriteOperation {
  entities: Record<string, EntityOperation>;

  /**
   * Whether the client has finished sending all entities or not. When `true`
   * will set the domain's `isMigrated` to `true`
   */
  finished: boolean;
}

export interface SyncOperation {
  entities: Record<string, EntityOperation>;

  /**
   * Search for all modifications from this point to return to the user
   */
  lastSubmittedAt: string;
}

export interface BulkReadOptions {
  entity: string;
  fromIndex: number;
  pageSize: number;
}

export interface EntityOperation {
  fields: {
    create: UpsertFieldOperation;
    update: UpsertFieldOperation;
    /**
     * List of ids of fields to delete
     */
    delete: (string | number)[];
  }
  wasDeleted: boolean;
  updatedAt: string;
  submittedAt: string;
}

export type UpsertFieldOperation = Record<string, any> & { id: string | number }[];

export interface OperationsReturn {
  entities: Record<string, EntityOperation>;
  /**
   * Used in bulk-read to know if there are more pages to read
   */
  finished: boolean;
  page: number;
  nextIndex: number;
  /**
   * The lasted entity update time that was sent on "entities" field
   */
  lastSubmittedAt: string;
}