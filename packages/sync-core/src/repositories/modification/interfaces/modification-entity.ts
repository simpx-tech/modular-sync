export interface ModificationEntity {
  id: number | string;
  repository: number | string;
  domain: number | string;
  entity: string;
  operation: "create" | "update" | "delete";
  entityId: number | string;
  submittedAt: Date;
  updatedAt: Date;
  wasDeleted: boolean;
  fieldOperations: Record<string, any>;
}

export interface CreateModification {
  repository: number | string;
  domain: number | string;
  entity: string;
  operation: "create" | "update" | "delete";
  entityId: number | string;
  submittedAt: Date;
  updatedAt: Date;
  wasDeleted: boolean;
  fieldOperations: Record<string, any>;
}