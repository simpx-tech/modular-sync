import {DiffEngine} from "../interfaces/diff-engine";
import {DatabaseAdapter} from "../interfaces/database-adapter";
import {ClientSyncEngineOptions} from "../interfaces/client-sync-engine-options";
import {SyncCredentials} from "./sync-credentials";
import {MetadataEntity} from "../interfaces/metadata-entity";

export class ClientSyncEngine {
  databaseAdapter: DatabaseAdapter;
  diffEngine: DiffEngine;
  repositoryName: string;
  syncCredentials: SyncCredentials;

  constructor({ databaseAdapter, diffEngine, repositoryName }: ClientSyncEngineOptions) {
    this.databaseAdapter = databaseAdapter;
    this.diffEngine = diffEngine;
    this.repositoryName = repositoryName;
  }

  async runSetup(repositoryName: string, syncCredentials?: SyncCredentials) {
    this.repositoryName = repositoryName;
    await this.databaseAdapter.connect();

    if (syncCredentials) {
      await this.authenticate(syncCredentials);
      await this.connectToRepository();
    }
  }

  async authenticate(syncCredentials: SyncCredentials){
    this.syncCredentials = await syncCredentials.auth();
    return this;
  }

  // TODO refactor?
  async connectToRepository() {
    if (!this.syncCredentials) {
      throw new Error("Should authenticate first, use the authenticate method with a SyncCredentials instance");
    }

    // The modifications engine should only be setup if is in sync state
    await this.diffEngine.runSetup(this);

    const hasRemoteRepository = await this.hasRemoteRepository(this.syncCredentials.repository);
    if (hasRemoteRepository) {
      const hasRemoteAlreadyMigrated = await this.hasRemoteAlreadyMigrated();

      if (hasRemoteAlreadyMigrated) {
        const hasLocalAlreadyMigrated = await this.hasLocalAlreadyMigrated();
        if (hasLocalAlreadyMigrated) {
          await this.syncIncremental();
        } else {
          await this.fetchAllRemoteRepository();
        }
      } else {
        await this.sendAllChanges();
      }
    } else {
      await this.createRemoteRepositoryAndSendAll();
    }
  }

  async syncIncremental() {
    await this.diffEngine.sync();
  }

  async hasLocalAlreadyMigrated() {
    const metadata = await this.databaseAdapter.getFirst<MetadataEntity>("sync-metadata");

    if (!metadata) {
      return false;
    }

    return metadata.migrationFinished;
  }

  async hasRemoteAlreadyMigrated() {
    const queryString = new URLSearchParams({
      repository: this.syncCredentials.repository
    });

    const repositoryMetaRes = await fetch(`${this.syncCredentials.remoteSyncUrl}/repository?${queryString.toString()}`);

    if (repositoryMetaRes.status !== 200) {
      throw new Error(`error while trying to get the remote repository meta: ${await repositoryMetaRes.json()}`)
    }

    const repositoryMeta = await repositoryMetaRes.json() as { migrationFinished: boolean };

    return repositoryMeta.migrationFinished;
  }

  async hasRemoteRepository(repository: string) {
    const queryString = new URLSearchParams({
      repository
    });

    const repositoryMetaRes = await fetch(`${this.syncCredentials.remoteSyncUrl}/repository?${queryString.toString()}`);

    return repositoryMetaRes.status === 200;
  }

  // If the remote repository does not exist, or it exists, but the migration doesn't end
  // Other users can only see the repository if the migration is finished
  async createRemoteRepositoryAndSendAll() {
    const repositoryMetaRes = await fetch(`${this.syncCredentials.remoteSyncUrl}/repository`, {
      body: JSON.stringify({}),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.syncCredentials.token}`
      },
    });

    if (repositoryMetaRes.status !== 201) {
      throw new Error(`error while trying to create the remote repository: ${await repositoryMetaRes.json()}`)
    }

    await this.sendAllChanges()
  }

  async listRepositories() {
    const listRes = await fetch(`${this.syncCredentials.remoteSyncUrl}/repository`, {
      headers: {
        "Authorization": `Bearer ${this.syncCredentials.token}`
      },
    });

    if (listRes.status !== 200) {
      throw new Error(`error while trying to list the repositories: ${await listRes.json()}`)
    }

    return await listRes.json();
  }

  async sendAllChanges() {
    await this.diffEngine.sendAll();
  }

  async fetchAllRemoteRepository(){
    await this.diffEngine.fetchAll();
  }
}