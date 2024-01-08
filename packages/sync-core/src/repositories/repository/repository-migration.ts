import {Migration} from "../../interfaces/migration";
import {DatabaseAdapter, SchemaType} from "../../interfaces/database-adapter";
import {RepositoryRepository} from "./repository-repository";

export class CreateRepositoryMigration implements Migration {
  async runOnce(databaseAdapter: DatabaseAdapter) {
    await databaseAdapter.createEntity(RepositoryRepository.ENTITY, {
      name: SchemaType.String,
      // TODO should standardize the sync_users entity name
      user: SchemaType.Connection("sync_users"),
    })
  }
}