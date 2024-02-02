import {ServerSyncEngine} from "../../src/server/server-sync-engine";

/**
 * MUST USE `setupAuthentication` BEFORE THIS
 * @param syncEngine
 */
export async function setupRepositories(syncEngine: ServerSyncEngine) {
  await syncEngine.repositoryRepository.create({
    name: "test-repository",
    user: 1,
  });

  await syncEngine.repositoryRepository.create({
    name: "test-repository2",
    user: 1,
  });

  // The one without domains
  await syncEngine.repositoryRepository.create({
    name: "test-repository3",
    user: 1,
  });
}