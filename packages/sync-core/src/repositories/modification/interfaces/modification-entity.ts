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
  updatedAt: Date;
  /**
   * If this is an update, the new values of the fields (additive, not the whole entity)
   */
  fieldOperations: Record<string, any>;
}

export interface CreateModification {
  repository: number | string;
  domain: number | string;
  entity: string;
  operation: "create" | "update" | "delete";
  entityId: number | string;
  uuid: string;
  submittedAt: Date;
  updatedAt: Date;
  wasDeleted: boolean;
  fieldOperations: Record<string, any>;
}