import {
  CreateEntityOptions,
  DatabaseAdapter,
  EntitySchema, SchemaType,
  UpsertData,
  WasDeleted
} from "../interfaces/database-adapter";
import {Migration} from "../interfaces/migration";
import {ServerDomain} from "../server/server-domain";
import {ServerSyncEngine} from "../server/server-sync-engine";
import {MapSchemaToType} from "../interfaces/repository";
import {UseAOrB} from "../helpers/interfaces/use-a-or-b";
import {DOMAIN_ENTITY} from "../repositories/domain/domain-repository-constants";
import {REPOSITORY_ENTITY} from "../repositories/repository/repository-repository-constants";

export class RepositoryBase<
  TEntity extends { id: string | number } = undefined,
  TCreate extends Record<string, any> = undefined,
  TUpdate extends Record<string, any> = undefined,
  TSchema extends EntitySchema = EntitySchema,
> {
  readonly entityName: string;
  readonly schemaOptions: CreateEntityOptions;

  schema: EntitySchema;
  syncEngine: ServerSyncEngine;

  db: DatabaseAdapter;

  constructor(entityName: string, schema: TSchema, schemaOptions: CreateEntityOptions = {}) {
    this.entityName = entityName;
    this.schema = schema;
    this.schemaOptions = schemaOptions;
  }

  async runSetup(domain: ServerDomain) {
    return this.runSetupDirectly(domain.syncEngine, domain.name, domain.isVirtual);
  }

  async runSetupDirectly(syncEngine: ServerSyncEngine, domainName: string, isVirtual: boolean = false) {
    this.syncEngine = syncEngine;

    const entityName = this.entityName;

    this.schema = {
      ...this.schema,
      ...(!isVirtual && {
        repository: SchemaType.Connection(REPOSITORY_ENTITY),
        domain: SchemaType.Connection(DOMAIN_ENTITY),
        createdAt: SchemaType.Date,
        submittedAt: SchemaType.Date,
        updatedAt: SchemaType.Date,
        wasDeleted: SchemaType.Boolean,
      })
    }

    const schema = this.schema;

    const schemaOptions = this.schemaOptions;

    this.db = this.syncEngine.domains.find(d => d.name === domainName)?.databaseAdapter;
    if (!this.db) {
      throw new Error(`Couldn't find the Database Adapter for this domain when setting up the ${this.entityName} repository`);
    }

    this.syncEngine.migrationRunner.registerMigration(new class implements Migration {
      customName = `create-${domainName}-${entityName}`;

      async runOnce(db) {
        await db.createEntity(entityName, schema, schemaOptions);
      }
    });

    return this;
  }

  async create(data: UseAOrB<TCreate, MapSchemaToType<TSchema>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const input = this.db.converter.inbound.convert(data, this.schema);
    return this.db.converter.outbound.convert(await this.db.create(this.entityName, input), this.schema)
  }

  async getFirst(): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    return this.db.converter.outbound.convert(await this.db.getFirst(this.entityName), this.schema);
  };

  async getById(id: number | string): Promise<UseAOrB<TEntity, TSchema>> {
    return this.db.converter.outbound.convert(await this.db.getById(this.entityName, id), this.schema);
  }

  async getByField(mapping: Partial<Record<keyof UseAOrB<TSchema, TSchema>, any>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const input = this.db.converter.inbound.convert(mapping, this.schema);
    return this.db.converter.outbound.convert(await this.db.getByField(this.entityName, input), this.schema);
  }

  async getAllByField(mapping: Partial<Record<keyof UseAOrB<TSchema, TSchema>, any>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const input = this.db.converter.inbound.convert(mapping, this.schema);
    const all = await this.db.getAllByField(this.entityName, input)
    return all.map(item => this.db.converter.outbound.convert(item, this.schema));
  }

  async getAll(): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const all = await this.db.getAll(this.entityName)
    return all.map(item => this.db.converter.outbound.convert(item, this.schema));
  }

  async createIfNotExists(keyFields: string[], data: UseAOrB<TCreate, MapSchemaToType<TSchema>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const input = this.db.converter.inbound.convert(data, this.schema);
    return this.db.converter.outbound.convert(await this.db.createIfNotExists(this.entityName, keyFields, input), this.schema);
  }

  async update(id: number | string, data: UseAOrB<TUpdate, MapSchemaToType<TSchema>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const input = this.db.converter.inbound.convert(data, this.schema);
    return this.db.converter.outbound.convert(await this.db.update(this.entityName, id, input), this.schema);
  }

  async upsert(search: Partial<Record<keyof UseAOrB<TSchema, TSchema>, any>>, data: UseAOrB<TUpdate, MapSchemaToType<TSchema>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>> {
    const input = this.db.converter.inbound.convert(data, this.schema);
    const searchInput = this.db.converter.inbound.convert(search, this.schema);
    return this.db.converter.outbound.convert(await this.db.upsert(this.entityName, searchInput, input), this.schema);
  }

  async delete(id: number | string): Promise<WasDeleted> {
    return this.db.delete(this.entityName, id)
  }

  async deleteByField(mapping: Record<string, any>): Promise<WasDeleted> {
    const input = this.db.converter.inbound.convert(mapping, this.schema);
    return this.db.deleteByField(this.entityName, input);
  }

  registerCreateMiddleware(middleware: ((data: UseAOrB<TCreate, UpsertData>) => void)): void {
    this.db.registerCreateMiddleware((entity, data) => {
      if (entity === this.entityName) {
        middleware(data  as UseAOrB<TCreate, UpsertData>);
      }
    });
  }

  registerUpdateMiddleware(middleware: ((id: string | number, data: UseAOrB<TUpdate, UpsertData>) => void)): void {
    this.db.registerUpdateMiddleware((entity, id, data) => {
      if (entity === this.entityName) {
        middleware(id, data as UseAOrB<TUpdate, UpsertData>);
      }
    });
  }

  registerDeleteMiddleware(middleware: ((id: string | number) => void)): void {
    this.db.registerDeleteMiddleware((entity, id) => {
      if (entity === this.entityName) {
        middleware(id);
      }
    });
  }
}