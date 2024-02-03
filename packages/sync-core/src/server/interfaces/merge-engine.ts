import {ServerSyncEngine} from "../server-sync-engine";
import {ServerDomain} from "../server-domain";
import {RepositoryBase} from "../../common/repository-base";

export interface MergeEngine {
  modificationRepository: RepositoryBase<any, any, any, any>;
  dynamicFieldRepository: RepositoryBase<any, any, any, any>;

  runSetup(domain: ServerDomain, syncEngine: ServerSyncEngine): Promise<void>;
  sync(identity: Identity, operation: any): Promise<{}>;
  push(identity: Identity, operation: PushOperation): Promise<PushSuccessReturn>;
  pull(identity: Identity, options: PullOptions): Promise<{}>;
}

export interface Identity {
  domain: string;
  repositoryId: string | number;
}

export interface PushOperation {
  // TODO should convert dates in the router adapter
  modifications: EntityModification[];
  submittedAt: Date;
  lastChangedAt: Date;

  /**
   * Whether the client has finished sending all entities or not. When `true`
   * will set the domain's `isMigrated` to `true`
   */
  finished: boolean;
}

export interface EntityModification {
  entity: string,
  changedAt: Date,
  operation: EntityModificationType,
  creationUUID: string,
  uuid: string,
  // TODO Change based on the `type`
  data: Record<string, any>
}

export enum EntityModificationType {
  CreateEntity = "create-entity",
  UpdateEntity = "update-entity",
  DeleteEntity = "delete-entity",
  CreateDynamicField = "create-dynamic-field",
  UpdateDynamicField = "update-dynamic-field",
  DeleteDynamicField = "delete-dynamic-field"
}

export interface PullOptions {
  entity: string;
  fromIndex: number;
  pageSize: number;
}

export interface PushSuccessReturn {
  lastSubmittedAt: string;
  status: "success"
}