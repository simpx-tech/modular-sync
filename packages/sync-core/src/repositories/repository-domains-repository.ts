import {RepositoryOptions} from "./interfaces/repository-options";
import {DatabaseAdapter, SchemaType, WasDeleted} from "../interfaces/database-adapter";
import {RepositoryRepository} from "./repository-repository";
import {CreateDomain, DomainRepositoryEntity, UpdateDomain} from "./interfaces/domain-repository-entity";

export class RepositoryDomainsRepository {
  private databaseAdapter: DatabaseAdapter;

  static ENTITY = 'sync_repository_domains';

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup() {
    await this.databaseAdapter.createEntity(RepositoryDomainsRepository.ENTITY, {
      readableName: SchemaType.String,
      prefix: SchemaType.String,
      repository: SchemaType.Connection(RepositoryRepository.ENTITY),
      isMigrated: SchemaType.Boolean,
    });

    return this;
  }

  async getByRepositoryId(repositoryId: number | string): Promise<DomainRepositoryEntity> {
    return await this.databaseAdapter.getByField<DomainRepositoryEntity>(RepositoryDomainsRepository.ENTITY, { repository: repositoryId });
  };

  async create(data: CreateDomain): Promise<any> {
    return await this.databaseAdapter.create(RepositoryDomainsRepository.ENTITY, data as Record<string, any>);
  };

  async update(domainId: number | string, data: UpdateDomain): Promise<any> {
    return await this.databaseAdapter.update(RepositoryDomainsRepository.ENTITY, domainId, data as Record<string, any>);
  };

  async deleteByRepositoryId(repositoryId: number | string): Promise<WasDeleted> {
    return await this.databaseAdapter.deleteByField(RepositoryDomainsRepository.ENTITY, { repository: repositoryId });
  }

  async exists(name: string) {
    return await this.databaseAdapter.getByField(RepositoryDomainsRepository.ENTITY, { name })
  }
}