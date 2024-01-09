import {RepositoryOptions} from "../interfaces/repository-options";
import {DatabaseAdapter, SchemaType, WasDeleted} from "../../interfaces/database-adapter";
import {RepositoryRepository} from "../repository/repository-repository";
import {CreateDomain, DomainEntity, UpdateDomain} from "../interfaces/domain-entity";
import {ServerSyncEngine} from "../../server/server-sync-engine";
import {CreateDomainMigration} from "./domain-migration";

export class DomainRepository {
  private databaseAdapter: DatabaseAdapter;
  private syncEngine: ServerSyncEngine;

  static ENTITY = 'sync_domains';
  static SCHEMA = {
    name: SchemaType.String,
    repository: SchemaType.Connection(RepositoryRepository.ENTITY),
    isMigrated: SchemaType.Boolean,
  }

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;
    this.syncEngine.migrationRunner.registerMigration(new CreateDomainMigration());
    return this;
  }

  async getAllByRepositoryId(repositoryId: number | string): Promise<DomainEntity[]> {
    const repository = await this.syncEngine.repositoryRepository.getById(repositoryId);

    if (!repository) {
      return [];
    }

    const responseArray = await this.databaseAdapter.getAllByField<DomainEntity[]>(DomainRepository.ENTITY, { repository: repositoryId })

    const existentDomains = responseArray.map((domain) => domain.name);
    const missingDomains = this.syncEngine.domains.filter((domain) => !existentDomains.includes(domain.name)).map((domain) => domain.name);
    const createdDomains = await Promise.all(missingDomains.map((domain) => this.createIfNotExists({ name: domain, repository: repositoryId, isMigrated: false })));

    return [...responseArray, ...createdDomains].map((data) => this.convertEntityFields(
      data
    ));
  };

  async create(data: CreateDomain): Promise<any> {
    const convertedData = this.databaseAdapter.converter.inbound.convert(data as Record<string, any>, DomainRepository.SCHEMA);

    return this.convertEntityFields(
      await this.databaseAdapter.create(DomainRepository.ENTITY, convertedData)
    );
  };

  async createIfNotExists(data: CreateDomain): Promise<any> {
    const convertedData = this.databaseAdapter.converter.inbound.convert(data as Record<string, any>, DomainRepository.SCHEMA);

    return this.convertEntityFields(
      await this.databaseAdapter.createIfNotExists(DomainRepository.ENTITY, ["name", "repository"], convertedData)
    );
  }

  async update(domainId: number | string, data: UpdateDomain): Promise<any> {
    const convertedData = this.databaseAdapter.converter.inbound.convert(data as Record<string, any>, DomainRepository.SCHEMA);

    return this.convertEntityFields(
      await this.databaseAdapter.update(DomainRepository.ENTITY, domainId, convertedData)
    );
  };

  async deleteByRepositoryId(repositoryId: number | string): Promise<WasDeleted> {
    return this.convertEntityFields(
      await this.databaseAdapter.deleteByField(DomainRepository.ENTITY, { repository: repositoryId })
    )
  }

  private convertEntityFields(data: any) {
    return this.databaseAdapter.converter.outbound.convert(data ?? {}, DomainRepository.SCHEMA);
  }
}