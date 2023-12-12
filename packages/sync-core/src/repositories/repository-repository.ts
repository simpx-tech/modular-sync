import {RepositoryEntity} from "./interfaces/repository-entity";
import {RepositoryOptions} from "./interfaces/repository-options";
import {DatabaseAdapter} from "../interfaces/database-adapter";

export class RepositoryRepository {
  private databaseAdapter: DatabaseAdapter;

  static ENTITY = "sync_repositories"

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup() {
    await this.databaseAdapter.createEntity(RepositoryRepository.ENTITY, {
      name: "string",
    })

    return this;
  }

  async getRepository(id: number | string): Promise<any> {};
  async getAllRepositories(): Promise<any> {};
  async createRepository(data: RepositoryEntity): Promise<any> {};
  async updateRepository(id: number | string, data: Partial<RepositoryEntity>): Promise<any> {};
  async deleteRepository(id: number | string): Promise<any> {};
}