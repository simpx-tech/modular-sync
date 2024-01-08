import {DatabaseAdapterOptions, Migration} from "../interfaces/migration";
import {DatabaseAdapter, SchemaType} from "../interfaces/database-adapter";

export class MigrationRunner {
  private readonly dbAdapter: DatabaseAdapter;
  private migrations: Set<Migration> = new Set();

  static MIGRATION_ENTITY = 'sync_schema_migrations';
  
  constructor({ dbAdapter }: DatabaseAdapterOptions) {
    this.dbAdapter = dbAdapter;
  }

  async runSetup() {
    await this.dbAdapter.createEntity(MigrationRunner.MIGRATION_ENTITY, {
      domain: SchemaType.String,
      name: SchemaType.String,
      migratedAt: SchemaType.Date,
    });
  }

  async runAllMigrations() {
    for (const migration of this.migrations) {
      if (migration.runOnce) {
        await migration.runOnce(this.dbAdapter);
      }
    }
  }

  registerMigration(migration: Migration) {
    this.migrations.add(migration);
  }
}