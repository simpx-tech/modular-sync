import {RepositoryEntity} from "./interfaces/repository-entity";
import {RepositoryOptions} from "./interfaces/repository-options";
import {DatabaseAdapter, SchemaType} from "../interfaces/database-adapter";
import {RepositoryRepository} from "./repository-repository";

export class DomainRepository {
  private databaseAdapter: DatabaseAdapter;

  static ENTITY = 'sync_domains';

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup() {
    await this.databaseAdapter.createEntity(DomainRepository.ENTITY, {
      name: SchemaType.String,
      repository: SchemaType.Connection(RepositoryRepository.ENTITY),
      isMigrated: SchemaType.Boolean,
    });

    return this;
  }

  async getRepository(id: number | string): Promise<any> {};
  async getAllRepositories(): Promise<any> {};
  async createRepository(data: RepositoryEntity): Promise<any> {};
  async updateRepository(id: number | string, data: Partial<RepositoryEntity>): Promise<any> {};
  async deleteRepository(id: number | string): Promise<any> {};
}