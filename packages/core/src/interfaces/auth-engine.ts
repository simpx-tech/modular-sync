import {ServerSyncEngine} from "../server/server-sync-engine";

export interface AuthEngine {
  runSetup(syncEngine: ServerSyncEngine): Promise<void>;
  authenticateUser(credentials: any): Promise<{ token: string, refreshToken?: string }>;
  refreshSession(): Promise<{ token: string, refreshToken?: string }>;
  isAuthenticated(token: any): Promise<boolean>;
}