import {DbMigrationEntity, UpsertDbMigrationEntity} from "./interfaces/db-migration-entity";
import {RepositoryOptions} from "./interfaces/repository-options";
import {DatabaseAdapter, SchemaType} from "../interfaces/database-adapter";

export class DbMigrationRepository {
  private databaseAdapter: DatabaseAdapter;

  static ENTITY = 'sync_migrations';

  constructor({ databaseAdapter }: RepositoryOptions) {
    this.databaseAdapter = databaseAdapter;
  }

  async runSetup() {
    await this.databaseAdapter.createEntity(DbMigrationRepository.ENTITY, {
      domain: SchemaType.String,
      name: SchemaType.String,
      migratedAt: SchemaType.Date,
    });

    return this;
  }

  async getByDomainAndName(domain: string, name: number | string): Promise<DbMigrationEntity> {
    return this.databaseAdapter.getByField<DbMigrationEntity>(DbMigrationRepository.ENTITY, { domain, name });
  };

  async create(data: UpsertDbMigrationEntity): Promise<void> {
    await this.databaseAdapter.create(DbMigrationRepository.ENTITY, data as Record<string, any>);
  };
}