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
    this.routerAdapter.registerRoute(HttpMethod.GET, "repository", this.getRepository.bind(this));

    for await (const domain of this.domains) {
      await domain.runSetup(this);
    }

    return this;
  }

  async getRepository (request: RouterRequest) {
    const { repository } = request.query;

    const repositoryData = await this.metadataDatabase.getByField(RepositoryRepository.ENTITY, { name: repository });

    if (!repositoryData) {
      throw new Error("Not found")
    }

    return repositoryData;
  }
}