import {ServerSyncEngine} from "../server-sync-engine";

export interface AuthEngine {
  runSetup(syncEngine: ServerSyncEngine): Promise<this>;
  authenticateUser(credentials: any): Promise<{ token: string, refreshToken?: string }>;
  refreshSession(): Promise<{ token: string, refreshToken?: string } | null>;
  isAuthenticated(token: any): Promise<boolean>;
  createUser(credentials: any): Promise<void>;
  activateUser(credentials: any): Promise<void>;
  deactivateUser(credentials: any): Promise<void>;
  decodeToken(token: string): Promise<any>;
}