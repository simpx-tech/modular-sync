import {EmailPasswordCredentials} from "./interfaces/email-password-credentials";
import {EmailPasswordAuthEngineOptions} from "./interfaces/email-assword-auth-engine-options";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import {UserEntity} from "./interfaces/user-entity";
import {AuthEngine} from "@simpx/sync-core/src/server/interfaces/auth-engine";
import {ServerSyncEngine} from "@simpx/sync-core/src/server/server-sync-engine";
import {HttpMethod} from "@simpx/sync-core/src/interfaces/http-method";
import {UnauthorizedException} from "@simpx/sync-core/src/server/exceptions/unauthorized-exception";
import {CreateUsersTableMigration} from "./migrations/create-users-table-migration";
import {AUTH_SCHEMA} from "./constants/joi-schemas";
import {USERS_ENTITY} from "@simpx/sync-core/src/server/constants/user-entity-name";
import {QueryBuilder} from "@simpx/sync-core/src/common/query-builder";
import {USERS_SCHEMA} from "./constants/users-schema";
import {EntitySchema} from "@simpx/sync-core/src/interfaces/database-adapter";

export class EmailPasswordAuthEngine implements AuthEngine {
  private syncEngine: ServerSyncEngine;
  private readonly jwtSecret: string;

  constructor({ jwtSecret }: EmailPasswordAuthEngineOptions) {
    this.jwtSecret = jwtSecret;
  }

  async runSetup(syncEngine: ServerSyncEngine) {
    this.syncEngine = syncEngine;

    this.syncEngine.routerAdapter.registerRoute(HttpMethod.POST, "auth", (req) => this.authenticateUser({
      email: req.body?.email,
      password: req.body?.password,
    }), { bodyJoiSchema: AUTH_SCHEMA });

    await this.runDbMigrations();

    return this;
  }

  async runDbMigrations() {
    this.syncEngine.migrationRunner.registerMigration(new CreateUsersTableMigration());
  }

  async authenticateUser(credentials: EmailPasswordCredentials){
    const { email, password } = credentials;

    const userRaw = await this.syncEngine.metadataDatabase.query(new QueryBuilder(USERS_ENTITY, this.syncEngine.metadataDatabase.converter, USERS_SCHEMA).where({ email }).fetchOne());
    const user = this.syncEngine.metadataDatabase.converter.outbound.convert(userRaw, USERS_SCHEMA);

    if (!user) {
      throw new UnauthorizedException("Wrong credentials");
    }

    if (!user.syncActivated) {
      throw new UnauthorizedException("Sync is not activated for this user");
    }

    const { encryptedPassword } = await this.encryptPassword(password, user.salt);

    if (encryptedPassword !== user.password) {
      throw new UnauthorizedException("Wrong credentials");
    }

    const token = this.signJwt(user);

    return Promise.resolve({ token })
  }

  async createUser(credentials: EmailPasswordCredentials) {
    const { encryptedPassword, salt } = await this.encryptPassword(credentials.password);

    const input = {
      email: credentials.email,
      password: encryptedPassword,
      syncActivated: true,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const res = await this.syncEngine.metadataDatabase.create(USERS_ENTITY, this.syncEngine.metadataDatabase.converter.inbound.convert(input, USERS_SCHEMA))

    return this.syncEngine.metadataDatabase.converter.outbound.convert(res, USERS_SCHEMA)
  }

  async activateUser(credentials: { userId: string | number }) {
    const res = await this.syncEngine.metadataDatabase.update(USERS_ENTITY, credentials.userId, this.syncEngine.metadataDatabase.converter.inbound.convert({ syncActivated: true }, USERS_SCHEMA))

    return this.syncEngine.metadataDatabase.converter.outbound.convert(res, USERS_SCHEMA)
  }

  async deactivateUser(credentials: { userId: string | number }) {
    const res = await this.syncEngine.metadataDatabase.update(USERS_ENTITY, credentials.userId, this.syncEngine.metadataDatabase.converter.inbound.convert({ syncActivated: false }, USERS_SCHEMA))

    return this.syncEngine.metadataDatabase.converter.outbound.convert(res, USERS_SCHEMA)
  }

  private async encryptPassword(password: string, salt?: string) {
    const saltRounds = 10;
    const hashSalt = salt ?? await bcrypt.genSalt(saltRounds);

    return {
      encryptedPassword: await bcrypt.hash(password, hashSalt),
      salt: hashSalt,
    };
  }

  /**
   * Verifies if the token is valid and the user has sync activated
   * @param token
   */
  isAuthenticated(token: any) {
    try {
      if (!token) return Promise.resolve(false);
      jwt.verify(token, this.jwtSecret);

      const decoded = jwt.decode(token, { json: true });

      if (!decoded.syncActivated) {
        return Promise.resolve(false);
      }

      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  // TODO: implement
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

  async decodeToken(token: string) {
    try {
      return jwt.decode(token, {
        json: true,
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}