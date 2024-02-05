import {DatabaseAdapterOptions, Migration} from "../interfaces/migration";
import {DatabaseAdapter, SchemaType} from "../interfaces/database-adapter";
import {QueryBuilder} from "../common/query-builder";

export class MigrationRunner {
  private readonly dbAdapter: DatabaseAdapter;
  migrations: Set<Migration> = new Set();

  static MIGRATION_ENTITY = 'sync_schema_migrations';
  
  constructor({ dbAdapter }: DatabaseAdapterOptions) {
    this.dbAdapter = dbAdapter;
  }

  async runSetup() {
    await this.dbAdapter.defineEntity(MigrationRunner.MIGRATION_ENTITY, {
      domain: SchemaType.String,
      name: SchemaType.String,
      migratedAt: SchemaType.Date,
    });
  }

  async runAllMigrations() {
    for await (const migration of this.migrations) {
      if (migration.runOnce) {
        const domain = migration.domain || "sync"

        const exists = await this.dbAdapter.query(new QueryBuilder(MigrationRunner.MIGRATION_ENTITY).where({ name: migration.constructor.name, domain }).fetchOne());
        if (exists) {
          continue;
        }

        await migration.runOnce(this.dbAdapter);

        await this.dbAdapter.create( MigrationRunner.MIGRATION_ENTITY, {
          domain,
          name: migration.customName || migration.constructor.name ||"unknown",
          migratedAt: new Date().getTime(),
        })
      }
    }
  }

  registerMigration(...migrations: Migration[]) {
    for (const migration of migrations) {
      this.migrations.add(migration);
    }
  }
}