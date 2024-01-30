import {RepositoryBase} from "../../common/repository-base";
import {CreateRepository, RepositoryEntity} from "./interfaces/repository-entity";
import {REPOSITORY_ENTITY, REPOSITORY_SCHEMA} from "./repository-repository-constants";

export class RepositoryRepository extends RepositoryBase<any, RepositoryEntity, CreateRepository, {}> {
  constructor() {
    super(REPOSITORY_ENTITY, REPOSITORY_SCHEMA, { unique: ["name", "user"] });
  }

  async getByName(name: string) {
    return this.db.getByField(REPOSITORY_ENTITY, { name })
  }

  async update(id: string | number, data: {}): Promise<never> {
    throw new Error("Shouldn't update repository")
  }
}