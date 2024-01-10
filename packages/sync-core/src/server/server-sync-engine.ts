import {DatabaseAdapter} from "../interfaces/database-adapter";
import {RouterRequest} from "./interfaces/router-callback";
import {ServerDomain} from "./server-domain";
import {HttpMethod} from "../interfaces/http-method";
import {ServerSyncEngineOptions} from "./interfaces/server-sync-engine-options";
import {AuthEngine} from "./interfaces/auth-engine";
import {RouterAdapter} from "./interfaces/router-adapter";
import {REPOSITORY_ENTITY, RepositoryRepository} from "../repositories/repository-repository";
import {DomainRepository} from "../repositories/domain-repository";
import {CreateRepository} from "../repositories/interfaces/repository-entity";
import {NotFoundException} from "./exceptions/not-found-exception";
import {UnauthorizedException} from "./exceptions/unauthorized-exception";
import {MigrationRunner} from "../migration/migration-runner";

export class ServerSyncEngine {
  readonly domains: ServerDomain[];
  readonly metadataDatabase: DatabaseAdapter;
  readonly routerAdapter: RouterAdapter;
  readonly authEngine: AuthEngine;
  readonly migrationRunner: MigrationRunner;

  repositoryRepository: RepositoryRepository;
  domainRepository: DomainRepository;

  constructor({ domains, metadataDatabase, routerAdapter, authEngine }: ServerSyncEngineOptions) {
    this.domains = domains;
    this.metadataDatabase = metadataDatabase;
    this.routerAdapter = routerAdapter;
    this.authEngine = authEngine;
    this.migrationRunner = new MigrationRunner({ dbAdapter: metadataDatabase });
  }

  async runSetup() {
    await this.metadataDatabase.connect();
    await this.routerAdapter.runSetup();

    this.repositoryRepository = await new RepositoryRepository().runSetupDirect(this, "internal-sync-domain")
    this.domainRepository = await new DomainRepository().runSetupDirect(this, "internal-sync-domain");

    await this.authEngine.runSetup(this);

    this.routerAdapter.registerRoute(HttpMethod.POST, "repository", this.createRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.DELETE, "repository", this.deleteRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "repository", this.getRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "repositories", this.getRepositoriesEndpoint.bind(this));

    this.routerAdapter.registerRoute(HttpMethod.PUT, "domain", this.updateDomainEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "domain", this.getDomainsByRepositoryEndpoint.bind(this));

    for await (const domain of this.domains) {
      // TODO allow slug parameters: /domain and /domain/:id
      await domain.runSetup(this);
    }

    await this.migrationRunner.runSetup()
    await this.migrationRunner.runAllMigrations()

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
    await this.metadataDatabase.delete(REPOSITORY_ENTITY, repositoryId);

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