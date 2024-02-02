import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";
import {DOMAIN_ENTITY} from "@simpx/sync-core/src/repositories/domain/domain-repository-constants";
import {REPOSITORY_ENTITY} from "@simpx/sync-core/src/repositories/repository/repository-repository-constants";
import {ModificationEntity} from "../interfaces/modification-entity";

export const MODIFICATION_ENTITY_BASE = "sync_modifications";

// TODO allow use ModificationEntity here to ensure correct typing, has to create a custom helper in TS to achieve this
export const MODIFICATION_SCHEMA = {
  repository: SchemaType.Connection(REPOSITORY_ENTITY),
  domain: SchemaType.Connection(DOMAIN_ENTITY),
  entity: SchemaType.String,
  operation: SchemaType.String,
  entityId: SchemaType.Id,
  uuid: SchemaType.String,
  submittedAt: SchemaType.Date,
  changedAt: SchemaType.Date,
  wasDeleted: SchemaType.Boolean,
  data: SchemaType.Stringified,
  fieldOperations: SchemaType.Json,
}