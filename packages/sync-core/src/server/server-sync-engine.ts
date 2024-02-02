import {DatabaseAdapter} from "../interfaces/database-adapter";
import {RouterRequest} from "./interfaces/router-callback";
import {ServerDomain} from "./server-domain";
import {HttpMethod} from "../interfaces/http-method";
import {ServerSyncEngineOptions} from "./interfaces/server-sync-engine-options";
import {AuthEngine} from "./interfaces/auth-engine";
import {RouterAdapter} from "./interfaces/router-adapter";
import {RepositoryRepository} from "../repositories/repository/repository-repository";
import {DomainRepository} from "../repositories/domain/domain-repository";
import {CreateRepository} from "../repositories/repository/interfaces/repository-entity";
import {NotFoundException} from "./exceptions/not-found-exception";
import {UnauthorizedException} from "./exceptions/unauthorized-exception";
import {MigrationRunner} from "../migration/migration-runner";
import {REPOSITORY_ENTITY} from "../repositories/repository/repository-repository-constants";
import {
  CREATE_REPOSITORY_SCHEMA,
  DELETE_REPOSITORY_SCHEMA, GET_DOMAIN_BY_REPOSITORY_SCHEMA,
  GET_REPOSITORY_SCHEMA
} from "./constants/router-joi-schemas";

// TODO separate server from client (core-common + core-client/core-server)
export class ServerSyncEngine {
  readonly domains: ServerDomain[];
  readonly metadataDatabase: DatabaseAdapter;
  readonly routerAdapter: RouterAdapter;
  readonly authEngine: AuthEngine;
  readonly migrationRunner: MigrationRunner;

  /**
   * Whether try to use mixed objects like in MongoDB when using separated fields storage
   * Only works if the database adapter supports it
   */
  readonly tryNestedObjectsForFieldSeparatedStorage: boolean;

  internalDomain: ServerDomain;
  repositoryRepository: RepositoryRepository;
  domainRepository: DomainRepository;

  constructor({ domains, metadataDatabase, routerAdapter, authEngine, tryNestedObjectsForFieldSeparatedStorage }: ServerSyncEngineOptions) {
    this.domains = domains;
    this.metadataDatabase = metadataDatabase;
    this.routerAdapter = routerAdapter;
    this.authEngine = authEngine;
    this.migrationRunner = new MigrationRunner({ dbAdapter: metadataDatabase });
    this.tryNestedObjectsForFieldSeparatedStorage = tryNestedObjectsForFieldSeparatedStorage ?? false;
  }

  async runSetup() {
    await this.routerAdapter.runSetup();

    this.repositoryRepository = new RepositoryRepository()
    this.domainRepository = new DomainRepository()

    this.internalDomain = new ServerDomain({
      name: "internal-sync-domain",
      databaseAdapter: this.metadataDatabase,
      mergeEngine: undefined,
      dynamicFieldsStrategy: undefined,
      repositories: [this.repositoryRepository, this.domainRepository],
      isVirtual: true,
    });
    this.domains.push(this.internalDomain);

    await this.authEngine.runSetup(this);

    this.routerAdapter.registerRoute(HttpMethod.POST, "repository", this.createRepositoryEndpoint.bind(this), { isPrivate: true, bodyJoiSchema: CREATE_REPOSITORY_SCHEMA });
    this.routerAdapter.registerRoute(HttpMethod.DELETE, "repository", this.deleteRepositoryEndpoint.bind(this), { isPrivate: true, queryJoiSchema: DELETE_REPOSITORY_SCHEMA });
    this.routerAdapter.registerRoute(HttpMethod.GET, "repository", this.getRepositoryEndpoint.bind(this), { isPrivate: true, queryJoiSchema: GET_REPOSITORY_SCHEMA });
    this.routerAdapter.registerRoute(HttpMethod.GET, "repositories", this.getRepositoriesEndpoint.bind(this), { isPrivate: true });

    this.routerAdapter.registerRoute(HttpMethod.GET, "domain", this.getDomainsByRepositoryEndpoint.bind(this), { isPrivate: true, queryJoiSchema: GET_DOMAIN_BY_REPOSITORY_SCHEMA });

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

  async getRepositoriesEndpoint (request: RouterRequest) {
    const { id } = request.decodedToken;
    return await this.repositoryRepository.getAllByField({ user: id });
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
      if (domain.isVirtual) {
        continue;
      }

      await this.domainRepository.create({
        repository: repository.id,
        name: domain.name,
        isMigrated: false,
      })
    }

    return { success: true };
  }

  async deleteRepositoryEndpoint(request: RouterRequest) {
    const {repositoryId} = request.query;

    await this.domainRepository.deleteByRepositoryId(repositoryId);
    await this.metadataDatabase.delete(REPOSITORY_ENTITY, repositoryId);

    return {success: true};
  }

  async getDomainsByRepositoryEndpoint(request: RouterRequest) {
    const { repositoryId } = request.query;

    return await this.domainRepository.getAllByRepositoryId(repositoryId);
  }
}