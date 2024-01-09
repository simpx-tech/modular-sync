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

export class DatabaseMerger implements MergeEngine {
  private syncEngine: ServerSyncEngine;

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;

    this.syncEngine.domains.forEach(domain => {
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/sync`, this.syncEndpoint.bind(this));
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/pull`, this.pullEndpoint.bind(this));
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/push`, this.pushEndpoint.bind(this));
    })
  }

  async syncEndpoint(req: RouterRequest) {

  }

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

  async push(identity: Identity, operation: PushOperation): Promise<OperationsReturn> {
    const domains = await this.syncEngine.domainRepository.getAllByRepositoryId(identity.repositoryId);
    const domain = domains.find(domain => domain.name === identity.domain);

    if (!domain) {
      throw new NotFoundException("Domain not found")
    }

    if (domain.isMigrated) {
      throw new ConflictException("Domain is already migrated");
    }

    const serverDomain = this.syncEngine.domains.find(domain => domain.name === identity.domain);

    for await (const [entityName, entityOperation] of Object.entries(operation.entities)) {
      const promises = entityOperation.map(async (entityOperation) => {
        const mergedFields = entityOperation.fields.create.reduce((acc, field) => ({...acc, [field.key]: field.value}), {});

        // Should get the schema of the domain (?) to properly cast the fields to the correct value

        console.log(entityName, {
          ...mergedFields,
          repository: identity.repositoryId,
          domain: domain.id,
          submittedAt: entityOperation.submittedAt,
          updatedAt: entityOperation.updatedAt,
          wasDeleted: entityOperation.wasDeleted,
        });

        await serverDomain.databaseAdapter.create(entityName, {
          ...mergedFields,
          repository: identity.repositoryId,
          domain: domain.id,
          submittedAt: entityOperation.submittedAt,
          updatedAt: entityOperation.updatedAt,
          wasDeleted: entityOperation.wasDeleted,
        });
      });

      await Promise.all(promises);
    }

    // Save all modifications

    if (operation.finished) {
      await this.syncEngine.domainRepository.update(domain.id, { isMigrated: true });
    }

    // DEV
    return { entities: {}, lastSubmittedAt: "2023-01-03T00:00:00.000Z" } as any;
  }

  sync(identity: Identity, operation: SyncOperation): Promise<OperationsReturn> {
    return Promise.resolve(undefined);
  }
}