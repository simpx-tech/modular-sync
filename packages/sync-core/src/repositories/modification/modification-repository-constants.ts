import {SchemaType} from "../../interfaces/database-adapter";
import {DOMAIN_ENTITY} from "../domain/domain-repository-constants";
import {REPOSITORY_ENTITY} from "../repository/repository-repository-constants";

export const MODIFICATION_ENTITY = "sync_modifications";

export const MODIFICATION_SCHEMA = {
  repository: SchemaType.Connection(REPOSITORY_ENTITY),
  domain: SchemaType.Connection(DOMAIN_ENTITY),
  entity: SchemaType.String,
  operation: SchemaType.String,
  entityId: SchemaType.Id,
  uuid: SchemaType.String,
  submittedAt: SchemaType.Date,
  updatedAt: SchemaType.Date,
  wasDeleted: SchemaType.Boolean,
  fieldOperations: SchemaType.Json,
}