import {WasDeleted} from "../../interfaces/database-adapter";
import {RepositoryBase} from "../../common/repository-base";
import {CreateDomain, DomainEntity, UpdateDomain} from "./interfaces/domain-entity";
import {DOMAIN_ENTITY, DOMAIN_SCHEMA} from "./domain-repository-constants";

export class DomainRepository extends RepositoryBase<DomainEntity, CreateDomain, UpdateDomain> {
  constructor() {
    super(DOMAIN_ENTITY, DOMAIN_SCHEMA, { unique: ["name", "repository"] });
  }

  async getAllByRepositoryId(repositoryId: number | string): Promise<DomainEntity[]> {
    const repository = await this.syncEngine.repositoryRepository.query(b => b.withId(repositoryId));

    if (!repository) {
      return [];
    }

    const responseArray = await this.query(b => b.where({ repository: repositoryId }));

    const existentDomains = responseArray.map((domain) => domain.name);
    const missingDomains = this.syncEngine.domains.filter((domain) => !existentDomains.includes(domain.name) && !domain.isVirtual).map((domain) => domain.name);
    const createdDomains = await Promise.all(missingDomains.map((domain) => this.createIfNotExists(["name", "repository"], { name: domain, repository: repositoryId, isMigrated: false })));

    return [...responseArray, ...createdDomains].map((data) => this.db.converter.outbound.convert(data ?? {}, DOMAIN_SCHEMA));
  };

  async deleteByRepositoryId(repositoryId: number | string): Promise<WasDeleted> {
    return this.db.deleteByField(DOMAIN_ENTITY, { repository: repositoryId })
  }
}