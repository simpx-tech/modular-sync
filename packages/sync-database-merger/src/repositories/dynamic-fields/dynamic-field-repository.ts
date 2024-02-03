import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {CreateDynamicField, DynamicFieldEntity, UpdateDynamicField} from "./interfaces/dynamic-field-entity";
import {DYNAMIC_FIELD_ENTITY, DYNAMIC_FIELD_SCHEMA} from "./constants/dynamic-field-constants";

export class DynamicFieldRepository extends RepositoryBase<DynamicFieldEntity, CreateDynamicField, UpdateDynamicField, {}> {
  constructor() {
    super(DYNAMIC_FIELD_ENTITY, DYNAMIC_FIELD_SCHEMA, { unique: ["key", "entityId"], isToIgnoreSyncFields: true });
  }
}