import {EntityModificationType} from "@simpx/sync-core/src/server/interfaces/merge-engine";

export interface ModificationEntity {
  id: number | string;
  repository: number | string;
  domain: number | string;
  entity: string;
  operation: EntityModificationType;
  creationUUID: string;
  /**
   * When this modification was submitted to the sync server
   */
  submittedAt: Date;
  /**
   * UUID of the modification. This id together with the updatedAt is used to identify unique modifications
   */
  uuid: string;
  /**
   * When the modification was performed on the client
   */
  changedAt: Date;
  /**
   * If this is an update, the new values of the fields (additive, not the whole entity)
   */
  data: Record<string, any>;
}

// TODO be based on the entity schema, make a helper for this
export interface CreateModification {
  repository: number | string;
  domain: number | string;
  entity: string;
  operation: EntityModificationType;
  creationUUID: string;
  uuid: string;
  submittedAt: Date;
  changedAt: Date;
  data: Record<string, any>;
}