import {
  PullOptions, PushOperation, Identity,
  MergeEngine, PushSuccessReturn,
} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import {RouterRequest} from "@simpx/sync-core/src/server/interfaces/router-callback";
import {NotFoundException} from "@simpx/sync-core/src/server/exceptions/not-found-exception";
import {ConflictException} from "@simpx/sync-core/src/server/exceptions/conflict-exception";
import {ServerDomain} from "@simpx/sync-core/src/server/server-domain";
import {CreateEntityStrategy} from "./push-strategies/create-entity-strategy";
import {InternalServerErrorException} from "@simpx/sync-core/src/server/exceptions/internal-errror-exception";
import {ModificationRepository} from "./repositories/modification/modification-repository";
import {DynamicFieldRepository} from "./repositories/dynamic-fields/dynamic-field-repository";
import {UnprocessableEntityException} from "@simpx/sync-core/src/server/exceptions/unprocessable-entity-exception";
import {IdIdentity} from "./interfaces/id-identity";

export class DatabaseMerger implements MergeEngine {
  private syncEngine: ServerSyncEngine;

  modificationRepository = new ModificationRepository();
  dynamicFieldRepository = new DynamicFieldRepository();

  createEntityStrategy = new CreateEntityStrategy();

  async runSetup(domain: ServerDomain, syncEngine: ServerSyncEngine): Promise<void> {
    this.syncEngine = syncEngine;

    // TODO add Joi validations
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/sync`, this.syncEndpoint.bind(this));
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/pull`, this.pullEndpoint.bind(this));
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/push`, this.pushEndpoint.bind(this));

    await this.modificationRepository.runSetup(domain);
    await this.dynamicFieldRepository.runSetup(domain);

    await this.createEntityStrategy.runSetup(this);
  }

  async syncEndpoint(req: RouterRequest) {}

  /**
   * This endpoint is used to migrate a domain.
   * It receives all entities of a domain from
   * the client
   * @param req
   */
  async pushEndpoint(req: RouterRequest) {
    const { repositoryId } = req.query as { domain: string, repositoryId: string };
    const path = req.path;
    const prefix = this.syncEngine.routerAdapter.path;

    return await this.push({ domain: this.getDomainFromPath(prefix, path), repositoryId }, req.body as PushOperation);
  }

  private getDomainFromPath(prefix: string, path: string) {
    return new RegExp(`.*${prefix}\\/(.*)\\/.*`, 'g').exec(path)[1];
  }

  async pullEndpoint(req: RouterRequest) {}

  pull(identity: Identity, options: PullOptions): Promise<{}> {
    return Promise.resolve(undefined);
  }

  /**
   * Receives all entities from the client
   * @param identity namespace for repository and domain ids
   * @param push
   */
  async push(identity: Identity, push: PushOperation): Promise<PushSuccessReturn> {
    const domainFromRepo = await this.syncEngine.domainRepository.getAllByRepositoryId(identity.repositoryId);
    const dbDomain = domainFromRepo.find(domain => domain.name === identity.domain);

    if (!dbDomain) {
      throw new NotFoundException("Domain entity not found")
    }

    if (dbDomain.isMigrated) {
      throw new ConflictException("Domain is already migrated");
    }

    const serverDomain = this.syncEngine.domains.find(domain => domain.name === identity.domain);

    if (!serverDomain) {
      throw new NotFoundException("Domain not registered on the server");
    }

    await this.runStrategy(
      push,
      { repositoryId: identity.repositoryId, domainId: dbDomain.id },
      serverDomain,
    );

    if (push.finished) {
      await this.syncEngine.domainRepository.update(dbDomain.id, {isMigrated: true});
    }

    // DEV
    return {entities: {}, lastSubmittedAt: "2023-01-03T00:00:00.000Z"} as any;
  }

  async runStrategy(push: PushOperation, identity: IdIdentity, syncDomain: ServerDomain) {
    const strategyFnByType = {
      "create-entity": this.createEntityStrategy.handle,
      "update-entity": this.createEntityStrategy.handle,
      "delete-entity": this.createEntityStrategy.handle,
      "create-dynamic-field": this.createEntityStrategy.handle,
      "update-dynamic-field": this.createEntityStrategy.handle,
      "delete-dynamic-field": this.createEntityStrategy.handle,
    }

    for await (const modification of push.modifications) {
      const repository = syncDomain.repositories.find(repo => repo.entityName === modification.entity);

        if (!repository) {
          console.warn(`Repository for entity ${modification.entity} not found`)
          continue;
        }

      await strategyFnByType[modification.type](identity, repository, modification, push);
    }
  }

  sync(identity: Identity, operation: {}): Promise<{}> {
    return Promise.resolve(undefined);
  }
}