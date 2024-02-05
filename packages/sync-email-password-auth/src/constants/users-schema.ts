import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";

export const USERS_SCHEMA = {
  email: SchemaType.String,
    password: SchemaType.String,
  syncActivated: SchemaType.Boolean,
  salt: SchemaType.String,
  createdAt: SchemaType.String,
  updatedAt: SchemaType.String,
}