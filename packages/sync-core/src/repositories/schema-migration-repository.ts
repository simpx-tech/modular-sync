import {SchemaMigrationEntity, UpsertSchemaMigrationEntity} from "./interfaces/schema-migration-entity";
import {RepositoryOptions} from "./interfaces/repository-options";
import {DatabaseAdapter, SchemaType} from "../interfaces/database-adapter";

export class SchemaMigrationRepository {
  private databaseAdapter: DatabaseAdapter;

  static ENTITY = 'sync_schema_migrations';

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup() {
    await this.databaseAdapter.createEntity(SchemaMigrationRepository.ENTITY, {
      domain: SchemaType.String,
      name: SchemaType.String,
      migratedAt: SchemaType.Date,
    });

    return this;
  }

  async getByDomainAndName(domain: string, name: number | string): Promise<SchemaMigrationEntity> {
    return this.databaseAdapter.getByField<SchemaMigrationEntity>(SchemaMigrationRepository.ENTITY, { domain, name });
  };

  async create(data: UpsertSchemaMigrationEntity): Promise<void> {
    await this.databaseAdapter.create(SchemaMigrationRepository.ENTITY, data as Record<string, any>);
  };
}