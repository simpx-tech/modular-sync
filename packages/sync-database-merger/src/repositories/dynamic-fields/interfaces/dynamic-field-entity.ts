export interface DynamicFieldEntity {
  id?: number | string;
  /**
   * For database is the column name, for other entities, the ID of this field
   */
  key: string;
  /**
   * The Merger is responsible for parsing and serializing the value
   */
  value: string;
  entity: string;
  entityId: number | string;
  wasDeleted: boolean;
  submittedAt: Date;
  updatedAt: Date;
  createdAt: Date;
}

export interface CreateDynamicField {
  uuid: string;
  key: string;
  value: string;
  entity: string;
  entityId: number | string;
  submittedAt: Date;
  updatedAt: Date;
  wasDeleted: boolean;
}

export interface UpdateDynamicField {
  value: string;
  entity: string;
  entityId: number | string;
  submittedAt: Date;
  updatedAt: Date;
  wasDeleted: boolean;
}