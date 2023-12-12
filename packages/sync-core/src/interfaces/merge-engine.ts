import {ServerSyncEngine} from "../server/server-sync-engine";

export interface MergeEngine {
  runSetup(syncEngine: ServerSyncEngine): Promise<void>;
}