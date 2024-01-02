import {ServerSyncEngine} from "../../src/server/server-sync-engine";

export async function setupDomains(syncEngine: ServerSyncEngine) {
  await syncEngine.domainRepository.create({
    name: "test-domain",
    repository: 1,
    isMigrated: false,
  });

  await syncEngine.domainRepository.create({
    name: "test-domain",
    repository: 2,
    isMigrated: false,
  });
}