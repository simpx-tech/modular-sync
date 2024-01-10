import {SchemaType} from "../interfaces/database-adapter";
import {RepositoryBase} from "../common/repository-base";
import {CreateRepository, RepositoryEntity} from "./interfaces/repository-entity";

export const REPOSITORY_ENTITY = 'sync_repositories';

export const REPOSITORY_SCHEMA = {
  name: SchemaType.String,
  // TODO should standardize the sync_users entity name
  user: SchemaType.Connection("sync_users"),
}

export class RepositoryRepository extends RepositoryBase<any, RepositoryEntity, CreateRepository, {}> {
  constructor() {
    super(REPOSITORY_ENTITY, REPOSITORY_SCHEMA);
  }

  async getByName(name: string) {
    return this.db.getByField(REPOSITORY_ENTITY, { name })
  }

  async update(id: string | number, data: {}): Promise<never> {
    throw new Error("Shouldn't update repository")
  }
}