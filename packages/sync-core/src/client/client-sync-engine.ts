import {SyncCredentials} from "./sync-credentials";
import {MetadataEntity} from "../interfaces/metadata-entity";
import {ClientDomain} from "./client-domain";

export class ClientSyncEngine {
  repositoryName: string;
  syncCredentials: SyncCredentials;
  domains: ClientDomain[];

  constructor(domains: ClientDomain[]) {
    this.domains = domains;
  }

  async runSetup(repositoryName: string, syncCredentials?: SyncCredentials) {
    this.repositoryName = repositoryName;

    for await (const domain of this.domains) {
      await domain.runSetup(this);
    }

    if (syncCredentials) {
      await this.authenticate(syncCredentials);
      await this.connectToRepository();
    }
  }

  async authenticate(syncCredentials: SyncCredentials){
    this.syncCredentials = await syncCredentials.auth();
  }

  // TODO refactor?
  async connectToRepository() {
    if (!this.syncCredentials) {
      throw new Error("Should authenticate first, use the authenticate method with a SyncCredentials instance");
    }

    for await (const domain of this.domains) {
      const hasRemoteDomain = await this.hasRemoteDomain(this.syncCredentials.repository);
      if (hasRemoteDomain) {
        const hasRemoteAlreadyMigrated = await this.remoteAlreadyMigrated();

        if (hasRemoteAlreadyMigrated) {
          const hasLocalAlreadyMigrated = await this.hasLocalAlreadyMigrated();
          if (hasLocalAlreadyMigrated) {
            await this.syncIncremental(domain);
          } else {
            await this.fetchAllFromRemote();
          }
        } else {
          await this.sendAllChangesToRemote();
        }
      } else {
        await this.createRemoteDomainAndSendAll();
      }
    }
  }

  async syncIncremental(domain: ClientDomain) {
    await this.diffEngine.sync();
  }

  async hasLocalAlreadyMigrated() {
    const metadata = await this.databaseAdapter.getFirst<MetadataEntity>("sync-metadata");

    if (!metadata) {
      return false;
    }

    return metadata.migrationFinished;
  }

  async remoteAlreadyMigrated() {
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

  async hasRemoteDomain(repository: string) {
    const queryString = new URLSearchParams({
      repository
    });

    const repositoryMetaRes = await fetch(`${this.syncCredentials.remoteSyncUrl}/repository?${queryString.toString()}`);

    return repositoryMetaRes.status === 200;
  }

  // If the remote repository does not exist, or it exists, but the migration doesn't end
  // Other users can only see the repository if the migration is finished
  async createRemoteDomainAndSendAll(domain: ClientDomain) {
    const repositoryMetaRes = await fetch(`${this.syncCredentials.remoteSyncUrl}/repository`, {
      body: JSON.stringify({
        repository: this.syncCredentials.repository,
        domain: domain.prefix,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.syncCredentials.token}`
      },
    });

    if (repositoryMetaRes.status !== 201) {
      throw new Error(`error while trying to create the remote repository: ${await repositoryMetaRes.json()}`)
    }

    await this.sendAllChangesToRemote()
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

  async sendAllChangesToRemote() {
    await this.diffEngine.migrateSendAll();
  }

  async fetchAllFromRemote(){
    await this.diffEngine.migrateFetchAll();
  }
}