import {CreateEntityOptions, DatabaseAdapter, EntitySchema} from "../interfaces/database-adapter";
import {Migration} from "../interfaces/migration";
import {ServerDomain} from "../server/server-domain";
import {ServerSyncEngine} from "../server/server-sync-engine";
import {MapSchemaToType} from "../interfaces/repository";
import {UseAOrB} from "../helpers/interfaces/use-a-or-b";

export class RepositoryBase<
  TSchema extends Record<string, any>,
  TEntity extends Record<string, any> = undefined,
  TCreate extends Record<string, any> = undefined,
  TUpdate extends Record<string, any> = undefined
> {
  readonly entityName: string;
  readonly schema: EntitySchema;
  readonly schemaOptions: CreateEntityOptions;

  db: DatabaseAdapter;

  constructor(entityName: string, schema: TSchema, schemaOptions: CreateEntityOptions = {}) {
    this.entityName = entityName;
    this.schema = schema;
    this.schemaOptions = schemaOptions;
  }

  async runSetup(domain: ServerDomain, syncEngine: ServerSyncEngine) {
    const entityName = this.entityName;
    const schema = this.schema;
    const schemaOptions = this.schemaOptions;

    this.db = syncEngine.domains.find(d => d.name === domain.name)?.databaseAdapter;
    if (!this.db) {
      throw new Error(`Couldn't find the Database Adapter for this domain when setting up the ${this.entityName} repository`);
    }

    syncEngine.migrationRunner.registerMigration(new class implements Migration {
      customName = `create-${domain.name}-${entityName}`;

      async runOnce(db) {
        await db.createEntity(entityName, schema, schemaOptions);
      }
    });
  }

  async create(data: UseAOrB<TCreate, MapSchemaToType<TSchema>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const input = this.db.converter.inbound.convert(data, this.schema);
    return this.db.converter.outbound.convert(await this.db.create(this.entityName, input), this.schema)
  }
}