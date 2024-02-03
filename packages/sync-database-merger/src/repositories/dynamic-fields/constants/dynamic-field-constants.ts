import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";

export const DYNAMIC_FIELD_ENTITY = "sync_dynamic_field";

export const DYNAMIC_FIELD_SCHEMA = {
  key: SchemaType.String,
  value: SchemaType.String,
  entity: SchemaType.String,
  creationUUID: SchemaType.String,
  wasDeleted: SchemaType.Boolean,
  deletedAt: SchemaType.Date,
  changedAt: SchemaType.Date,
  createdAt: SchemaType.Date,
  submittedAt: SchemaType.Date,
}