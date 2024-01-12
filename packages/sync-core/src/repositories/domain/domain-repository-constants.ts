import {SchemaType} from "../../interfaces/database-adapter";

import {REPOSITORY_ENTITY} from "../repository/repository-repository-constants";

export const DOMAIN_ENTITY = 'sync_domains';

export const DOMAIN_SCHEMA = {
  name: SchemaType.String,
  repository: SchemaType.Connection(REPOSITORY_ENTITY),
  isMigrated: SchemaType.Boolean,
}