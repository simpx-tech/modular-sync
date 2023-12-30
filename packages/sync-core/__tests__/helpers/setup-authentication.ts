import {ServerSyncEngine} from "../../src/server/server-sync-engine";

export async function setupAuthentication(syncEngine: ServerSyncEngine) {
  await syncEngine.authEngine.createUser({ email: "test@gmail.com", password: "123456" });
  return syncEngine.authEngine.authenticateUser({ email: "test@gmail.com", password: "123456" });
}