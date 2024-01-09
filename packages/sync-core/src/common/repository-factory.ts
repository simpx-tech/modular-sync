import {
  DatabaseAdapter,
  EntitySchema, UpsertData, WasDeleted,
} from "../interfaces/database-adapter";
import {MapSchemaToType, Repository} from "../interfaces/repository";
import {Migration} from "../interfaces/migration";
import {ServerSyncEngine} from "../server/server-sync-engine";
import {ServerDomain} from "../server/server-domain";

export class RepositoryFactory {
  static create<
    TSchema extends EntitySchema,
    TEntity extends Record<string, any> = undefined,
    TCreate extends Record<string, any> = undefined,
    TUpdate extends Record<string, any> = undefined
  >(entityName: string, domain: ServerDomain, schema: TSchema): Repository<MapSchemaToType<TSchema>, TEntity, TCreate, TUpdate> {
    return new class implements Repository<MapSchemaToType<TSchema>, TEntity, TCreate, TUpdate> {
      db: DatabaseAdapter;
      schema: EntitySchema = schema;

      creationMigration = new class implements Migration {
        async runOnce(db: DatabaseAdapter) {
          await db.createEntity(entityName, schema);
        }
      }

      runSetup(syncEngine: ServerSyncEngine) {
        this.db = syncEngine.domains.find(d => d.name === domain.name)?.databaseAdapter;
        if (!this.db) {
          throw new Error(`Couldn't find the Database Adapter for this domain when setting up the ${entityName} repository`);
        }

        syncEngine.migrationRunner.registerMigration(this.creationMigration);
      }

      create(data: UpsertData) {
        return this.db.create(entityName, data);
      }

      createIfNotExists(keyFields: string[], data: UpsertData) {
        return this.db.createIfNotExists(entityName, keyFields, data)
      }

      delete(id: number | string): Promise<WasDeleted> {
        return this.db.delete(entityName, id);
      }

      deleteByField(mapping: Record<string, any>): Promise<WasDeleted> {
        return this.db.deleteByField(entityName, mapping);
      }

      getAll<T = any>(): Promise<T> {
        return this.db.getAll(entityName);
      }

      getAllByField(mapping: Record<string, any>) {
        return this.db.getAllByField(entityName, mapping);
      }

      getByField(mapping: Record<string, any>) {
        return this.db.getByField(entityName, mapping);
      }

      getById(id: number | string) {
        return this.db.getById(entityName, id);
      }

      getFirst() {
        return this.db.getFirst(entityName);
      }

      update(id: number | string, data: UpsertData) {
        return this.db.update(entityName, id, data)
      }

      registerCreateMiddleware(middleware: (data: UpsertData) => void): void {

      }

      registerDeleteMiddleware(middleware: (id: (string | number)) => void): void {
      }

      registerUpdateMiddleware(middleware: (id: (string | number), data: UpsertData) => void): void {
      }
    }
  }
}