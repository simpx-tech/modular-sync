import {Migration} from "@simpx/sync-core/src/interfaces/migration";
import {DatabaseAdapter, SchemaType} from "@simpx/sync-core/src/interfaces/database-adapter";
import {EmailPasswordAuthEngine} from "../email-password-auth-engine";

export class CreateUsersTableMigration implements Migration {
  async runOnce(databaseAdapter: DatabaseAdapter) {
    await databaseAdapter.createEntity(EmailPasswordAuthEngine.USERS_ENTITY, {
      email: SchemaType.String,
      password: SchemaType.String,
      syncActivated: SchemaType.Boolean,
      salt: SchemaType.String,
      createdAt: SchemaType.String,
      updatedAt: SchemaType.String,
    })
  }
}