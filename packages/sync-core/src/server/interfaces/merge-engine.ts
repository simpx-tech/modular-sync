import {ServerSyncEngine} from "../server-sync-engine";

export interface MergeEngine {
  runSetup(syncEngine: ServerSyncEngine): Promise<void>;
  sync(): Promise<void>;
  receiveAll(): Promise<void>;
  sendAll(): Promise<void>;
}