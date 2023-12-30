import {RepositoryOptions} from "./interfaces/repository-options";
import {DatabaseAdapter, SchemaType, WasDeleted} from "../interfaces/database-adapter";
import {RepositoryRepository} from "./repository-repository";
import {CreateDomain, DomainEntity, UpdateDomain} from "./interfaces/domain-entity";

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

  async getByRepositoryId(repositoryId: number | string): Promise<DomainEntity> {
    return await this.databaseAdapter.getByField<DomainEntity>(DomainRepository.ENTITY, { repository: repositoryId });
  };

  async create(data: CreateDomain): Promise<any> {
    return await this.databaseAdapter.create(DomainRepository.ENTITY, data as Record<string, any>);
  };

  async update(domainId: number | string, data: UpdateDomain): Promise<any> {
    return await this.databaseAdapter.update(DomainRepository.ENTITY, domainId, data as Record<string, any>);
  };

  async deleteByRepositoryId(repositoryId: number | string): Promise<WasDeleted> {
    return await this.databaseAdapter.deleteByField(DomainRepository.ENTITY, { repository: repositoryId });
  }

  async exists(name: string) {
    return await this.databaseAdapter.getByField(DomainRepository.ENTITY, { name })
  }
}