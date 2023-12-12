import {EmailPasswordCredentials} from "./interfaces/email-password-credentials";
import {EmailPasswordAuthEngineOptions} from "./interfaces/email-assword-auth-engine-options";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import {UserEntity} from "./interfaces/user-entity";
import {AuthEngine} from "@simpx/sync-core/src/server/interfaces/auth-engine";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import {SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";

export class EmailPasswordAuthEngine implements AuthEngine {
  private syncEngine: ServerSyncEngine;
  private readonly jwtSecret: string;

  constructor({ jwtSecret }: EmailPasswordAuthEngineOptions) {
    this.jwtSecret = jwtSecret;
  }

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;
    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, "auth", this.authenticateUser.bind(this));

    await this.runDbMigrations();
  }

  // TODO create a Migration class with run and rollback methods
  async runDbMigrations() {
    const MIGRATION_DOMAIN = "sync-auth";
    const MIGRATION_NAME = "create-users-table";

    const usersMigration = await this.syncEngine.dbMigrationRepository.getByDomainAndName(MIGRATION_DOMAIN, MIGRATION_NAME);

    if (!usersMigration) {
      await this.syncEngine.metadataDatabase.createEntity("sync_users", {
        email: SchemaType.String,
        password: SchemaType.String,
        syncActivated: SchemaType.Boolean,
        createdAt: SchemaType.String,
        updatedAt: SchemaType.String,
      })

      await this.syncEngine.dbMigrationRepository.create({
        domain: MIGRATION_DOMAIN,
        name: MIGRATION_NAME,
        migratedAt: new Date().getTime(),
      })
    }
  }

  async authenticateUser(credentials: EmailPasswordCredentials) {
    const user = await this.syncEngine.metadataDatabase.getByField<UserEntity>("users", {
      email: credentials.email,
    });

    if (!user) {
      throw new Error("Wrong credentials");
    }

    if (!user.syncActivated) {
      throw new Error("Sync is not activated for this user");
    }

    const encryptedPassword = await this.encryptPassword(credentials.password);

    if (encryptedPassword !== user.password) {
      throw new Error("Wrong credentials");
    }

    const token = this.signJwt(user);

    return Promise.resolve({ token })
  }

  async createUser(credentials: any) {
    const encryptedPassword = await this.encryptPassword(credentials.password);

    await this.syncEngine.metadataDatabase.create("users", {
      email: credentials.email,
      password: encryptedPassword,
      syncActivated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async activateUser(userId: string | number) {
    await this.syncEngine.metadataDatabase.update("users", userId, {
      syncActivated: true,
    })
  }

  async deactivateUser(userId: string | number) {
    await this.syncEngine.metadataDatabase.update("users", userId, {
      syncActivated: false,
    })
  }

  private async encryptPassword(password: string, salt?: string) {
    const saltRounds = 10;
    const hashSalt = salt ?? await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, hashSalt);
  }

  isAuthenticated(token: any) {
    try {
      const decoded = jwt.decode(token, { json: true });

      if (!decoded.syncActivated) {
        return Promise.resolve(false);
      }

      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  refreshSession() {
    return Promise.resolve(null);
  }

  private signJwt(user: any) {
    const { id, syncActivated } = user;

    return jwt.sign({
      id,
      syncActivated,
    }, this.jwtSecret);
  }
}