import {ServerSyncEngine} from "../server-sync-engine";

export interface MergeEngine {
  runSetup(syncEngine: ServerSyncEngine): Promise<void>;
}