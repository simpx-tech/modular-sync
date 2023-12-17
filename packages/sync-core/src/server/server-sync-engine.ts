import {DatabaseAdapter} from "../interfaces/database-adapter";
import {RouterRequest} from "./interfaces/router-callback";
import {ServerDomain} from "./server-domain";
import {HttpMethod} from "../interfaces/http-method";
import {ServerSyncEngineOptions} from "./interfaces/server-sync-engine-options";
import {AuthEngine} from "./interfaces/auth-engine";
import {RouterAdapter} from "./interfaces/router-adapter";
import {DbMigrationRepository} from "../repositories/db-migration-repository";
import {RepositoryRepository} from "../repositories/repository-repository";
import {DomainRepository} from "../repositories/domain-repository";
import {CreateRepository} from "../repositories/interfaces/repository-entity";
import {convertId} from "../utils/convertId";

export class ServerSyncEngine {
  readonly domains: ServerDomain[];
  readonly metadataDatabase: DatabaseAdapter;
  readonly routerAdapter: RouterAdapter;
  readonly authEngine: AuthEngine;

  dbMigrationRepository: DbMigrationRepository;
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
    this.dbMigrationRepository = await new DbMigrationRepository({ databaseAdapter: this.metadataDatabase}).runSetup();
    this.repositoryRepository = await new RepositoryRepository({ databaseAdapter: this.metadataDatabase}).runSetup()
    this.domainRepository = await new DomainRepository({ databaseAdapter: this.metadataDatabase}).runSetup();

    await this.authEngine.runSetup(this);
    
    this.routerAdapter.registerRoute(HttpMethod.POST, "repository", this.createRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.DELETE, "repository", this.deleteRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "repository", this.getRepositoryEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "repositories", this.getRepositoriesEndpoint.bind(this));

    this.routerAdapter.registerRoute(HttpMethod.POST, "domain", this.createDomainEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.PUT, "domain", this.updateDomainEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.DELETE, "domain", this.deleteDomainEndpoint.bind(this));
    this.routerAdapter.registerRoute(HttpMethod.GET, "domain", this.getDomainByRepositoryEndpoint.bind(this));
    // TODO allow query parameters
    this.routerAdapter.registerRoute(HttpMethod.GET, "domains", this.listDomainsEndpoint.bind(this));

    for await (const domain of this.domains) {
      await domain.runSetup(this);
    }

    return this;
  }

  async getRepositoryEndpoint (request: RouterRequest) {
    const { repository } = request.query;

    const repositoryData = await this.repositoryRepository.getByName(repository);

    if (!repositoryData) {
      throw new Error("Not found")
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
      throw Error("Malformed token");
    }

    await this.repositoryRepository.create({
      ...insertData,
      user: decoded.id,
    } as CreateRepository);

    return { success: true };
  }

  async deleteRepositoryEndpoint(request: RouterRequest) {
    const { repositoryId } = request.query;

    await this.metadataDatabase.delete(RepositoryRepository.ENTITY, repositoryId);

    return { success: true };
  }

  async createDomainEndpoint(request: RouterRequest) {
    const data = request.body;
    const { id } = request.decodedToken;
    const { repositoryId } = request.query;

    const repository = await this.repositoryRepository.getById(convertId(repositoryId));

    if (!repository) {
      throw new Error("Repository not found");
    }

    const domainAlreadyExists = await this.domainRepository.getByNameAndUser(data.name, id);

    if (domainAlreadyExists) {
      throw new Error("Domain already exists");
    }

    await this.domainRepository.create({
      name: data.name,
      isMigrated: false,
      repository: convertId(repositoryId),
      user: id,
    });

    return { success: true }
  }

  async updateDomainEndpoint(request: RouterRequest) {
    const data = request.body;
    const { domainId } = request.query;

    await this.domainRepository.update(domainId, {
      isMigrated: data.isMigrated,
    });

    return { success: true }
  }

  async deleteDomainEndpoint(request: RouterRequest) {
    const { domainId } = request.query;

    const deleteRes = await this.domainRepository.delete(domainId);

    if (!deleteRes.wasDeleted) {
      throw new Error("Domain not found");
    }

    return { success: true }
  }

  async getDomainByRepositoryEndpoint(request: RouterRequest) {
    const { repositoryId } = request.query;

    return await this.domainRepository.getByRepositoryId(repositoryId);
  }

  async listDomainsEndpoint(request: RouterRequest) {
    const { id } = request.decodedToken;

    return await this.domainRepository.getAllFromUser(id);
  }
}