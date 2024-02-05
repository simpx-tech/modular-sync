import {
  PullOptions, PushOperation, Identity,
  MergeEngine, PushSuccessReturn, EntityModificationType, PullSuccessReturn, EntityModification,
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
import {IdIdentity} from "./interfaces/id-identity";
import {UpdateEntityStrategy} from "./push-strategies/update-entity-strategy";
import {DeleteEntityStrategy} from "./push-strategies/delete-entity-strategy";
import {CreateDynamicFieldStrategy} from "./push-strategies/create-dynamic-field-strategy";
import {UpdateDynamicFieldStrategy} from "./push-strategies/update-dynamic-field-strategy";
import {DeleteDynamicFieldStrategy} from "./push-strategies/delete-dynamic-field-strategy";
import {lessThan} from "@simpx/sync-core/src/common/query-operations";

export class DatabaseMerger implements MergeEngine {
  private syncEngine: ServerSyncEngine;
  private domain: ServerDomain;

  modificationRepository = new ModificationRepository();
  dynamicFieldRepository = new DynamicFieldRepository();

  createEntityStrategy = new CreateEntityStrategy();
  updateEntityStrategy = new UpdateEntityStrategy();
  deleteEntityStrategy = new DeleteEntityStrategy();
  createDynamicFieldStrategy = new CreateDynamicFieldStrategy();
  updateDynamicFieldStrategy = new UpdateDynamicFieldStrategy();
  deleteDynamicFieldStrategy = new DeleteDynamicFieldStrategy();

  async runSetup(domain: ServerDomain, syncEngine: ServerSyncEngine): Promise<void> {
    this.syncEngine = syncEngine;
    this.domain = domain;

    // TODO add Joi validations
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `repo/:repositoryId/${this.domain.name}/push`, this.pushEndpoint.bind(this));
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `repo/:repositoryId/${this.domain.name}/pull`, this.pullEndpoint.bind(this));
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `repo/:repositoryId/${this.domain.name}/sync`, this.syncEndpoint.bind(this));

    await this.modificationRepository.runSetup(this.domain);
    await this.dynamicFieldRepository.runSetup(this.domain);

    await this.createEntityStrategy.runSetup(this);
    await this.updateEntityStrategy.runSetup(this);
    await this.deleteEntityStrategy.runSetup(this);
    await this.createDynamicFieldStrategy.runSetup(this);
    await this.updateDynamicFieldStrategy.runSetup(this);
    await this.deleteDynamicFieldStrategy.runSetup(this);
  }

  /**
   * This endpoint is used to migrate a domain.
   * It receives all entities of a domain from
   * the client
   * @param req
   */
  async pushEndpoint(req: RouterRequest) {
    const { repositoryId } = req.params as { repositoryId: string };

    return await this.push({ domain: this.domain.name, repositoryId }, req.body as PushOperation);
  }

  async pullEndpoint(req: RouterRequest) {
    const { repositoryId } = req.params as { repositoryId: string };

    return await this.pull({ domain: this.domain.name, repositoryId }, req.body as PullOptions);
  }

  async pull(identity: Identity, options: PullOptions): Promise<PullSuccessReturn> {
    const domainsFromRepo = await this.syncEngine.domainRepository.getAllByRepositoryId(identity.repositoryId);

    const domainDb = domainsFromRepo.find(domain => domain.name === identity.domain)

    if (!domainDb) {
      throw new NotFoundException("Domain entity not found");
    }

    if (!domainDb.isMigrated) {
      throw new ConflictException("Domain is not migrated yet");
    }

    const modifications = await this.modificationRepository.query(b =>
        b.where({
          domain: domainDb.id,
          submittedAt: lessThan(options.untilSubmittedAt)
        })
      .limit(options.pageSize)
      .startFrom(options.fromIndex)
      .orderBy({ changedAt: "asc" })
    );

    return {
      modifications,
      lastChangedAt: modifications.slice(-1)[0]?.changedAt,
      lastSubmittedAt: modifications.slice(-1)[0]?.submittedAt,
      lastIndex: options.fromIndex + modifications.length,
      pageSize: options.pageSize,
    };
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

    return {status: "success", lastChangedAt: push.modifications.slice(-1)[0]?.changedAt };
  }

  async runStrategy(push: PushOperation, identity: IdIdentity, syncDomain: ServerDomain) {
    const strategyFnByType = {
      [EntityModificationType.CreateEntity]: this.createEntityStrategy.handle.bind(this.createEntityStrategy),
      [EntityModificationType.UpdateEntity]: this.updateEntityStrategy.handle.bind(this.updateEntityStrategy),
      [EntityModificationType.DeleteEntity]: this.deleteEntityStrategy.handle.bind(this.deleteEntityStrategy),
      [EntityModificationType.CreateDynamicField]: this.createDynamicFieldStrategy.handle.bind(this.createDynamicFieldStrategy),
      [EntityModificationType.UpdateDynamicField]: this.updateDynamicFieldStrategy.handle.bind(this.updateDynamicFieldStrategy),
      [EntityModificationType.DeleteDynamicField]: this.deleteDynamicFieldStrategy.handle.bind(this.deleteDynamicFieldStrategy),
    }

    for await (const modification of push.modifications) {
      const repository = syncDomain.repositories.find(repo => repo.entityName === modification.entity);

        if (!repository) {
          // TODO add test of this
          console.error(`Internal Repository for entity ${modification.entity} not found`)
          throw new InternalServerErrorException("Internal Repository not found");
        }

      await strategyFnByType[modification.operation](identity, repository, modification, push);
    }
  }

  async syncEndpoint(req: RouterRequest) {}

  sync(identity: Identity, operation: {}): Promise<{}> {
    return Promise.resolve(undefined);
  }
}