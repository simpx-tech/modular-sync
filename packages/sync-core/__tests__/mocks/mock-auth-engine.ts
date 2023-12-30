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

  async decodeToken(token: string): Promise<any> {
    return {
      id: 1
    };
  }

  isAuthenticated(token: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  refreshSession(): Promise<{ token: string; refreshToken?: string } | null> {
    return Promise.resolve(null);
  }

  runSetup(syncEngine: ServerSyncEngine): Promise<this> {
    return Promise.resolve(this);
  }
}