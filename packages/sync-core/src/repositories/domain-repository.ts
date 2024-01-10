import {SchemaType, WasDeleted} from "../interfaces/database-adapter";
import {REPOSITORY_ENTITY} from "./repository-repository";
import {RepositoryBase} from "../common/repository-base";
import {CreateDomain, DomainEntity, UpdateDomain} from "./interfaces/domain-entity";

export const DOMAIN_ENTITY = 'sync_domains';

export const DOMAIN_SCHEMA = {
  name: SchemaType.String,
  repository: SchemaType.Connection(REPOSITORY_ENTITY),
  isMigrated: SchemaType.Boolean,
}

export class DomainRepository extends RepositoryBase<any, DomainEntity, CreateDomain, UpdateDomain> {
  constructor() {
    super(DOMAIN_ENTITY, DOMAIN_SCHEMA, { unique: ["name", "repository"] });
  }

  async getAllByRepositoryId(repositoryId: number | string): Promise<DomainEntity[]> {
    const repository = await this.syncEngine.repositoryRepository.getById(repositoryId);

    if (!repository) {
      return [];
    }

    const responseArray = await this.db.getAllByField<DomainEntity[]>(DOMAIN_ENTITY, { repository: repositoryId })

    const existentDomains = responseArray.map((domain) => domain.name);
    const missingDomains = this.syncEngine.domains.filter((domain) => !existentDomains.includes(domain.name)).map((domain) => domain.name);
    const createdDomains = await Promise.all(missingDomains.map((domain) => this.createIfNotExists(["name", "repository"], { name: domain, repository: repositoryId, isMigrated: false })));

    return [...responseArray, ...createdDomains].map((data) => this.db.converter.outbound.convert(data ?? {}, DOMAIN_SCHEMA));
  };

  async deleteByRepositoryId(repositoryId: number | string): Promise<WasDeleted> {
    return this.db.deleteByField(DOMAIN_ENTITY, { repository: repositoryId })
  }
}