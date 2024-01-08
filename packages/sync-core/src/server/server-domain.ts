import {DatabaseAdapter} from "../interfaces/database-adapter";
import {MergeEngine} from "./interfaces/merge-engine";
import {ServerDomainOptions} from "../interfaces/server-domain-options";
import {ServerSyncEngine} from "./server-sync-engine";
import {FieldStorageMethod} from "./enums/field-storage-method";

export class ServerDomain {
  readonly databaseAdapter: DatabaseAdapter;
  readonly mergeEngine: MergeEngine;
  readonly name: string;
  readonly fieldsStorageMethod: FieldStorageMethod;

  syncEngine: ServerSyncEngine;

  constructor({
    databaseAdapter,
    mergeEngine,
    name,
    fieldsStorageMethod,
  }: ServerDomainOptions) {
    this.databaseAdapter = databaseAdapter;
    this.mergeEngine = mergeEngine;
    this.name = name;
    this.fieldsStorageMethod = fieldsStorageMethod;
  }

  /**
   * Initializes its connection with the database and runs the helpers of the merge engine
   * @param syncEngine
   */
  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;

    await this.databaseAdapter.connect();
    await this.mergeEngine.runSetup(this.syncEngine);
  }
}