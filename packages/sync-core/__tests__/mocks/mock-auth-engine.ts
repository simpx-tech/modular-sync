import {AuthEngine} from "../../src/server/interfaces/auth-engine";
import {ServerSyncEngine} from "../../src/server/server-sync-engine";

export class MockAuthEngine implements AuthEngine {
  activateUser(credentials: any): Promise<void> {
    return Promise.resolve(undefined);
  }

  authenticateUser(credentials: any): Promise<{ token: string; refreshToken?: string }> {
    return Promise.resolve({ token: "" });
  }

  createUser(credentials: any): Promise<void> {
    return Promise.resolve(undefined);
  }

  deactivateUser(credentials: any): Promise<void> {
    return Promise.resolve(undefined);
  }

  decodeToken(token: string): Promise<any> {
    return Promise.resolve(undefined);
  }

  isAuthenticated(token: any): Promise<boolean> {
    return Promise.resolve(false);
  }

  refreshSession(): Promise<{ token: string; refreshToken?: string } | null> {
    return Promise.resolve(undefined);
  }

  runSetup(syncEngine: ServerSyncEngine): Promise<void> {
    return Promise.resolve(undefined);
  }
}