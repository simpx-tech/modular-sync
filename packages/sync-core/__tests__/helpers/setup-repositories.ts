import {ServerSyncEngine} from "../../src/server/server-sync-engine";

export async function setupRepositories(syncEngine: ServerSyncEngine) {
  await syncEngine.repositoryRepository.create({
    name: "test",
    user: 1,
  });

  await syncEngine.repositoryRepository.create({
    name: "test2",
    user: 1,
  });
}