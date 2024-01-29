import {DatabaseAdapter} from "../interfaces/database-adapter";
import {MergeEngine} from "./interfaces/merge-engine";
import {ServerDomainOptions} from "../interfaces/server-domain-options";
import {ServerSyncEngine} from "./server-sync-engine";
import {DynamicFieldsStrategy} from "./enums/dynamic-fields-strategy";
import {RepositoryBase} from "../common/repository-base";

export class ServerDomain {
  readonly mergeEngine?: MergeEngine;

  readonly databaseAdapter: DatabaseAdapter;
  readonly name: string;
  readonly dynamicFieldsStrategy: DynamicFieldsStrategy;
  readonly repositories: RepositoryBase<any>[];

  /**
   * Doesn't create domain entity on the database
   */
  readonly isVirtual: boolean;

  syncEngine: ServerSyncEngine;

  constructor({
    databaseAdapter,
    mergeEngine,
    name,
    dynamicFieldsStrategy,
    repositories = [],
    isVirtual,
  }: ServerDomainOptions) {
    this.databaseAdapter = databaseAdapter;
    this.mergeEngine = mergeEngine;
    this.name = name;
    this.dynamicFieldsStrategy = dynamicFieldsStrategy;
    this.repositories = repositories;
    this.isVirtual = isVirtual ?? false;
  }

  /**
   * Initializes its connection with the database and runs the helpers of the merge engine
   * @param syncEngine
   */
  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;

    // TODO should create the Dynamic Fields Adapter here
    for await (const repository of this.repositories) {
      await repository.runSetup(this);
    }

    await this.databaseAdapter.connect();
    if (this.mergeEngine) {
      await this.mergeEngine.runSetup(this, this.syncEngine);
    }
  }
}