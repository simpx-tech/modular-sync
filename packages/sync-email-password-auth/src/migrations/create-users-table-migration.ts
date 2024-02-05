import {Migration} from "@simpx/sync-core/src/interfaces/migration";
import {DatabaseAdapter, SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";
import {EmailPasswordAuthEngine} from "../email-password-auth-engine";
import {USERS_ENTITY} from "@simpx/sync-core/src/server/constants/user-entity-name";
import {USERS_SCHEMA} from "../constants/users-schema";

export class CreateUsersTableMigration implements Migration {
  async runOnce(databaseAdapter: DatabaseAdapter) {
    await databaseAdapter.defineEntity(USERS_ENTITY, USERS_SCHEMA)
  }
}