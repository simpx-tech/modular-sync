export interface ModificationEntity {
  id: number | string;
  repository: number | string;
  domain: number | string;
  entity: string;
  operation: "create" | "update" | "delete";
  entityId: number | string;
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

export interface CreateModification {
  repository: number | string;
  domain: number | string;
  entity: string;
  operation: "create" | "update" | "delete";
  entityId: number | string;
  uuid: string;
  submittedAt: Date;
  changedAt: Date;
  wasDeleted: boolean;
  data: Record<string, any>;
}