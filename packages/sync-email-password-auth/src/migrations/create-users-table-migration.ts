import {Migration} from "@simpx/sync-core/src/interfaces/migration";
import {DatabaseAdapter, SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";
import {EmailPasswordAuthEngine} from "../email-password-auth-engine";
import {USERS_ENTITY} from "@simpx/sync-core/src/server/constants/user-entity-name";

export class CreateUsersTableMigration implements Migration {
  async runOnce(databaseAdapter: DatabaseAdapter) {
    await databaseAdapter.defineEntity(USERS_ENTITY, {
      email: SchemaType.String,
      password: SchemaType.String,
      syncActivated: SchemaType.Boolean,
      salt: SchemaType.String,
      createdAt: SchemaType.String,
      updatedAt: SchemaType.String,
    })
  }
}