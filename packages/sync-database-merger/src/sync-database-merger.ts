import {
  PullOptions, PushOperation, Identity,
  MergeEngine,
  OperationsReturn, SyncOperation
} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import {RouterRequest} from "@simpx/sync-core/src/server/interfaces/router-callback";
import {NotFoundException} from "@simpx/sync-core/src/server/exceptions/not-found-exception";
import {ConflictException} from "@simpx/sync-core/src/server/exceptions/conflict-exception";
import isEnvironmentTornDown = jest.isEnvironmentTornDown;
import {ServerDomain} from "@simpx/sync-core/src/server/server-domain";

export class DatabaseMerger implements MergeEngine {
  private syncEngine: ServerSyncEngine;

  async runSetup(domain: ServerDomain, syncEngine: ServerSyncEngine): Promise<void> {
    this.syncEngine = syncEngine;

    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/sync`, this.syncEndpoint.bind(this));
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/pull`, this.pullEndpoint.bind(this));
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/push`, this.pushEndpoint.bind(this));
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

  pull(identity: Identity, options: PullOptions): Promise<OperationsReturn> {
    return Promise.resolve(undefined);
  }

  /**
   * Receives all entities from the client
   * @param identity namespace for repository and domain ids
   * @param push
   */
  async push(identity: Identity, push: PushOperation): Promise<OperationsReturn> {
    const domains = await this.syncEngine.domainRepository.getAllByRepositoryId(identity.repositoryId);
    const domain = domains.find(domain => domain.name === identity.domain);

    if (!domain) {
      throw new NotFoundException("Domain not found")
    }

    if (domain.isMigrated) {
      throw new ConflictException("Domain is already migrated");
    }

    const serverDomain = this.syncEngine.domains.find(domain => domain.name === identity.domain);

    // TODO check if is create, update or delete
    // TODO consider unified and separated fields
    for await (const [entityName, entityOperations] of Object.entries(push.entities)) {
      const promises = entityOperations.map(async (operation) => {
        const mergedFields = operation.fields.create.reduce((acc, field) => ({...acc, [field.key]: field.value}), {});

        const repository = serverDomain.repositories.find(repository => repository.entityName === entityName);

        if (!repository) {
          throw new Error(`Couldn't find the respective repository for ${entityName}`)
        }

        // TODO create upsert
        await repository.upsert({}, {
          ...mergedFields,
          repository: identity.repositoryId,
          domain: domain.id,
          createdAt: operation.createdAt,
          submittedAt: operation.submittedAt,
          updatedAt: operation.updatedAt,
          wasDeleted: operation.wasDeleted,
        });

        await repository.upsert({}, {})
      });

      await Promise.all(promises);
    }

    // TODO Save all modification


    if (push.finished) {
      await this.syncEngine.domainRepository.update(domain.id, { isMigrated: true });
    }

    // DEV
    return { entities: {}, lastSubmittedAt: "2023-01-03T00:00:00.000Z" } as any;
  }

  sync(identity: Identity, operation: SyncOperation): Promise<OperationsReturn> {
    return Promise.resolve(undefined);
  }
}