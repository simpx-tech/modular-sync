import {ClientSyncEngine} from "../client/client-sync-engine";

export interface ModificationsEngine {
  runSetup(syncEngine: ClientSyncEngine): Promise<void>;
  sendAll(): Promise<void>;
  fetchAll(): Promise<void>;
  sync(): Promise<void>;
}