import {RepositoryBase} from "../../common/repository-base";
import {MODIFICATION_ENTITY, MODIFICATION_SCHEMA} from "./modification-repository-constants";
import {CreateModification, ModificationEntity} from "./interfaces/modification-entity";

export class ModificationRepository extends RepositoryBase<ModificationEntity, CreateModification, {}, {}> {
  constructor() {
    super(MODIFICATION_ENTITY, MODIFICATION_SCHEMA, { unique: ["uuid", "updatedAt"] });
  }
}