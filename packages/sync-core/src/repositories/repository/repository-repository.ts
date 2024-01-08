import {CreateRepository, RepositoryEntity} from "../interfaces/repository-entity";
import {RepositoryOptions} from "../interfaces/repository-options";
import {DatabaseAdapter} from "../../interfaces/database-adapter";
import {ServerSyncEngine} from "../../server/server-sync-engine";
import {CreateDomainMigration} from "../domain/domain-migration";
import {CreateRepositoryMigration} from "./repository-migration";

export class RepositoryRepository {
  private databaseAdapter: DatabaseAdapter;

  static ENTITY = "sync_repositories"

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup(syncEngine: ServerSyncEngine) {
    syncEngine.migrationRunner.registerMigration(new CreateRepositoryMigration());
    return this;
  }

  async getById(id: number | string): Promise<any> {
    return this.databaseAdapter.getById(RepositoryRepository.ENTITY, id);
  };

  async getByName(name: string) {
    return this.databaseAdapter.getByField(RepositoryRepository.ENTITY, { name })
  }

  async getAll(): Promise<any> {
    return this.databaseAdapter.getAll(RepositoryRepository.ENTITY);
  };

  async create(data: CreateRepository): Promise<any> {
    return this.databaseAdapter.create(RepositoryRepository.ENTITY, {
      ...data,
    });
  };

  async update(id: number | string, data: Partial<RepositoryEntity>): Promise<any> {
    return this.databaseAdapter.update(RepositoryRepository.ENTITY, id, data as Record<string, any>);
  };

  // TODO: Should be soft delete
  async delete(id: number | string): Promise<any> {
    return this.databaseAdapter.delete(RepositoryRepository.ENTITY, id);
  };
}