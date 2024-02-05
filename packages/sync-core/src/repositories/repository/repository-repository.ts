import {RepositoryBase} from "../../common/repository-base";
import {CreateRepository, RepositoryEntity} from "./interfaces/repository-entity";
import {REPOSITORY_ENTITY, REPOSITORY_SCHEMA} from "./repository-repository-constants";

export class RepositoryRepository extends RepositoryBase<RepositoryEntity, CreateRepository, {}> {
  constructor() {
    super(REPOSITORY_ENTITY, REPOSITORY_SCHEMA, { unique: ["name", "user"] });
  }

  async update(id: string | number, data: {}): Promise<never> {
    throw new Error("Shouldn't update repository")
  }
}