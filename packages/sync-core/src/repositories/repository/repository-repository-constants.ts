import {SchemaType} from "../../interfaces/database-adapter";

export const REPOSITORY_ENTITY = 'sync_repositories';

export const REPOSITORY_SCHEMA = {
  name: SchemaType.String,
  // TODO should standardize the sync_users entity name
  user: SchemaType.Connection("sync_users"),
}