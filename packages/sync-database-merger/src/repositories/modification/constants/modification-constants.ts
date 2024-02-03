import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";
import {DOMAIN_ENTITY} from "@simpx/sync-core/src/repositories/domain/domain-repository-constants";
import {REPOSITORY_ENTITY} from "@simpx/sync-core/src/repositories/repository/repository-repository-constants";
import {ModificationEntity} from "../interfaces/modification-entity";

export const MODIFICATION_ENTITY_BASE = "sync_modifications";

// TODO allow use ModificationEntity here to ensure correct typing, has to create a custom helper in TS to achieve this
export const MODIFICATION_SCHEMA = {
  entity: SchemaType.String,
  // TODO add enum validation, add extra data, like Not Null, etc
  operation: SchemaType.String,
  creationUUID: SchemaType.String,
  uuid: SchemaType.String,
  submittedAt: SchemaType.Date,
  domain: SchemaType.Connection(DOMAIN_ENTITY),
  changedAt: SchemaType.Date,
  data: SchemaType.Stringified,
}