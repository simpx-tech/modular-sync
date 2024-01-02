import {
  BulkReadOptions, BulkWriteOperation, Identity,
  MergeEngine,
  OperationsReturn, SyncOperation
} from "@simpx/sync-core/src/server/interfaces/merge-engine";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import {RouterRequest} from "@simpx/sync-core/src/server/interfaces/router-callback";
import {NotFoundException} from "@simpx/sync-core/src/server/exceptions/not-found-exception";
import {ConflictException} from "@simpx/sync-core/src/server/exceptions/conflict-exception";

export class DatabaseMerger implements MergeEngine {
  private syncEngine: ServerSyncEngine;

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;

    this.syncEngine.domains.forEach(domain => {
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/sync`, this.syncEndpoint.bind(this));
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/bulk-read`, this.bulkReadEndpoint.bind(this));
      this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, `${domain.name}/bulk-write`, this.bulkWriteEndpoint.bind(this));
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
  async bulkWriteEndpoint(req: RouterRequest) {
    const { repositoryId } = req.query as { domain: string, repositoryId: string };
    const path = req.path;
    const prefix = this.syncEngine.routerAdapter.path;

    return await this.bulkWrite({ domain: this.getDomainFromPath(prefix, path), repositoryId }, req.body as BulkWriteOperation);
  }

  private getDomainFromPath(prefix: string, path: string) {
    return /.*sync\/(.*)\/.*/.exec(path)[1];
  }

  async bulkReadEndpoint(req: RouterRequest) {}

  bulkRead(identity: Identity, options: BulkReadOptions): Promise<OperationsReturn> {
    return Promise.resolve(undefined);
  }

  async bulkWrite(identity: Identity, operation: BulkWriteOperation): Promise<OperationsReturn> {
    const domains = await this.syncEngine.domainRepository.getAllByRepositoryId(identity.repositoryId);
    const domain = domains.find(domain => domain.name === identity.domain);

    console.log("write", await this.syncEngine.metadataDatabase.raw({ sql: "SELECT * FROM sync_domains", params: [], isQuery: true, fetchAll: true }))

    if (!domain) {
      throw new NotFoundException("Domain not found")
    }

    if (domain.isMigrated) {
      throw new ConflictException("Domain is already migrated");
    }

    if (operation.finished) {
      await this.syncEngine.domainRepository.update(domain.id, { isMigrated: true });
    }

    return Promise.resolve(undefined);
  }

  sync(identity: Identity, operation: SyncOperation): Promise<OperationsReturn> {
    return Promise.resolve(undefined);
  }
}