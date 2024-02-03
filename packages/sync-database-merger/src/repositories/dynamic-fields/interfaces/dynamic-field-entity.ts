export interface DynamicFieldEntity {
  id?: number | string;
  /**
   * For a database merger is the column name, for other types, the ID of this field
   */
  key: string;
  /**
   * The Merger is responsible for parsing and serializing the value
   */
  value: string;
  entity: string;
  creationUUID: string;
  wasDeleted: boolean;
  deletedAt: Date;
  submittedAt: Date;
  changedAt: Date;
  createdAt: Date;
}

export interface CreateDynamicField {
  key: string;
  value: string;
  entity: string;
  creationUUID: number | string;
  submittedAt: Date;
  changedAt: Date;
  createdAt: Date;
  deletedAt: Date;
  wasDeleted: boolean;
}

export interface UpdateDynamicField {
  value?: string;
  entity?: string;
  creationUUID?: string;
  submittedAt?: Date;
  changedAt?: Date;
  createdAt?: Date;
  deletedAt?: Date;
  wasDeleted?: boolean;
}