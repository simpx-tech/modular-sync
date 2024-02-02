import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";

export const DYNAMIC_FIELD_ENTITY = "sync_dynamic_field";

export const DYNAMIC_FIELD_SCHEMA = {
  key: SchemaType.String,
  value: SchemaType.Json,
  entity: SchemaType.String,
  entityId: SchemaType.Id,
  wasDeleted: SchemaType.Boolean,
  updatedAt: SchemaType.Date,
  createdAt: SchemaType.Date,
  submittedAt: SchemaType.Date,
}