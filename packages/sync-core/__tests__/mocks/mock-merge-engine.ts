import {MergeEngine} from "../../src/server/interfaces/merge-engine";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";

export class MockMergeEngine implements MergeEngine {
  runSetup(syncEngine: ServerSyncEngine): Promise<void> {
    return Promise.resolve(undefined);
  }

  bulkWrite(): Promise<void> {
    return Promise.resolve(undefined);
  }

  bulkRead(): Promise<void> {
    return Promise.resolve(undefined);
  }

  sync(): Promise<void> {
    return Promise.resolve(undefined);
  }
}