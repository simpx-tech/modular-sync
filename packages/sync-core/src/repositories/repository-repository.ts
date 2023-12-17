import {CreateRepository, RepositoryEntity} from "./interfaces/repository-entity";
import {RepositoryOptions} from "./interfaces/repository-options";
import {DatabaseAdapter, SchemaType} from "../interfaces/database-adapter";

export class RepositoryRepository {
  private databaseAdapter: DatabaseAdapter;

  static ENTITY = "sync_repositories"

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup() {
    await this.databaseAdapter.createEntity(RepositoryRepository.ENTITY, {
      name: SchemaType.String,
      // TODO should standardize the sync_users entity name
      user: SchemaType.Connection("sync_users"),
    })

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

  async delete(id: number | string): Promise<any> {
    return this.databaseAdapter.delete(RepositoryRepository.ENTITY, id);
  };
}