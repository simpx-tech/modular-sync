import {Migration} from "../../interfaces/migration";
import {DatabaseAdapter, SchemaType} from "../../interfaces/database-adapter";
import {DomainRepository} from "./domain-repository";
import {RepositoryRepository} from "../repository/repository-repository";

export class CreateDomainMigration implements Migration {
  async runOnce(databaseAdapter: DatabaseAdapter) {
    await databaseAdapter.createEntity(DomainRepository.ENTITY, DomainRepository.SCHEMA, { unique: ["name", "repository"] });
  }
}