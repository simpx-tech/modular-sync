import {DatabaseAdapter} from "../interfaces/database-adapter";
import {RouterRequest} from "./interfaces/router-callback";
import {ServerDomain} from "./server-domain";
import {HttpMethod} from "../interfaces/http-method";
import {ServerSyncEngineOptions} from "./interfaces/server-sync-engine-options";
import {AuthEngine} from "./interfaces/auth-engine";
import {RouterAdapter} from "./interfaces/router-adapter";
import {SchemaMigrationRepository} from "../repositories/schema-migration-repository";
import {RepositoryRepository} from "../repositories/repository-repository";
import {DomainRepository} from "../repositories/domain-repository";
import {CreateRepository} from "../repositories/interfaces/repository-entity";
import {NotFoundException} from "./exceptions/not-found-exception";
import {UnauthorizedException} from "./exceptions/unauthorized-exception";

export class ServerSyncEngine {
  readonly domains: ServerDomain[];
  readonly metadataDatabase: DatabaseAdapter;
  readonly routerAdapter: RouterAdapter;
  readonly authEngine: AuthEngine;

  schemaMigrationRepository: SchemaMigrationRepository;
  repositoryRepository: RepositoryRepository;
  domainRepository: DomainRepository;

  constructor({ domains, metadataDatabase, routerAdapter, authEngine }: ServerSyncEngineOptions) {
    this.domains = domains;
    this.metadataDatabase = metadataDatabase;
    this.routerAdapter = routerAdapter;
    this.authEngine = authEngine;
  }

  async runSetup() {
    await this.metadataDatabase.connect();
    await this.routerAdapter.runSetup();

    this.schemaMigrationRepository = await new SchemaMigrationRepository({ databaseAdapter: this.metadataDatabase}).runSetup();
    this.repositoryRepository = await new RepositoryRepository({ databaseAdapter: this.metadataDatabase}).runSetup()
    this.domainRepository = await new DomainRepository({ databaseAdapter: this.metadataDatabase}).runSetup(this);

    await this.authEngine.runSetup(this);

    this.routerAdapter.registerRoute(HttpMethod.POST, "repository", this.createRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.DELETE, "repository", this.deleteRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "repository", this.getRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "repositories", this.getRepositoriesEndpoint.bind(this));

    this.routerAdapter.registerRoute(HttpMethod.PUT, "domain", this.updateDomainEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "domain", this.getDomainsByRepositoryEndpoint.bind(this));
    // TODO allow slug parameters: /domain and /domain/:id

    for await (const domain of this.domains) {
      await domain.runSetup(this);
    }

    return this;
  }

  async getRepositoryEndpoint (request: RouterRequest) {
    const { repository } = request.query;

    const repositoryData = await this.repositoryRepository.getByName(repository);

    if (!repositoryData) {
      throw new NotFoundException("Repository not found")
    }

    return repositoryData;
  }

  async getRepositoriesEndpoint () {
    return await this.repositoryRepository.getAll()
  }

  async createRepositoryEndpoint(request: RouterRequest) {
    const insertData = request.body;
    const decoded = await this.authEngine.decodeToken(request.token);

    if (!decoded?.id) {
      throw new UnauthorizedException("Malformed token");
    }

    const repository = await this.repositoryRepository.create({
      ...insertData,
      user: decoded.id,
    } as CreateRepository);

    for await (const domain of this.domains) {
      await this.domainRepository.create({
        repository: repository.id,
        name: domain.name,
        isMigrated: false,
      })
    }

    return { success: true };
  }

  async deleteRepositoryEndpoint(request: RouterRequest) {
    const { repositoryId } = request.query;

    await this.domainRepository.deleteByRepositoryId(repositoryId);
    await this.metadataDatabase.delete(RepositoryRepository.ENTITY, repositoryId);

    return { success: true };
  }

  async updateDomainEndpoint(request: RouterRequest) {
    const data = request.body;
    const { domainId } = request.query;

    await this.domainRepository.update(domainId, {
      isMigrated: data.isMigrated,
    });

    return { success: true }
  }

  async getDomainsByRepositoryEndpoint(request: RouterRequest) {
    const { repositoryId } = request.query;

    return await this.domainRepository.getAllByRepositoryId(repositoryId);
  }
}