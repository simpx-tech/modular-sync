import {RepositoryBase} from "@simpx/sync-core/src/common/repository-base";
import {MODIFICATION_ENTITY_BASE, MODIFICATION_SCHEMA} from "./constants/modification-constants";
import {CreateModification, ModificationEntity} from "./interfaces/modification-entity";

export class ModificationRepository extends RepositoryBase<ModificationEntity, CreateModification, {}, {}> {
  constructor() {
    super(MODIFICATION_ENTITY_BASE, MODIFICATION_SCHEMA, { unique: ["uuid"] });
  }
}