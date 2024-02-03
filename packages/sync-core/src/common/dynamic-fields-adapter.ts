import {
  DefineEntityOptions,
  DatabaseAdapter,
  EntitySchema,
  UpsertData,
  WasDeleted
} from "../interfaces/database-adapter";
import {DataConverterEngine} from "../interfaces/data-converter-engine";

// TODO finish implementation
// TODO add tests
/**
 * Wraps the Database Adapter and abstracts away the field storage logic from the repository
 */
export class DynamicFieldsAdapter implements DatabaseAdapter {
  converter: DataConverterEngine;

  constructor(
    private readonly databaseAdapter: DatabaseAdapter,
    private readonly tryNestedObjectsForFieldSeparatedStorage: boolean) {
  }

  connect(): Promise<void> {
    return this.databaseAdapter.connect();
  }

  create<T = any>(entity: string, data: UpsertData): Promise<T> {
    return this.databaseAdapter.create(entity, data);
  }

  // TODO in separated, have to change the schema before passing down
  defineEntity(entity: string, schema: EntitySchema, options?: DefineEntityOptions): Promise<void> {
    return this.databaseAdapter.defineEntity(entity, schema, options);
  }

  createIfNotExists<T = any>(entity: string, keyFields: string[], data: UpsertData): Promise<T> {
    return this.databaseAdapter.createIfNotExists(entity, keyFields, data);
  }

  delete(entity: string, id: number | string): Promise<WasDeleted> {
    return this.databaseAdapter.delete(entity, id);
  }

  deleteByField(entity: string, mapping: Record<string, any>): Promise<WasDeleted> {
    return this.databaseAdapter.deleteByField(entity, mapping);
  }

  disconnect(): Promise<void> {
    return this.databaseAdapter.disconnect();
  }

  getAll<T = any>(entity: string): Promise<T> {
    return this.databaseAdapter.getAll(entity);
  }

  getAllByField<T = any>(entity: string, search: Record<string, any>): Promise<T> {
    return this.databaseAdapter.getAllByField(entity, search);
  }

  getByField<T = any>(entity: string, search: Record<string, any>): Promise<T> {
    return this.databaseAdapter.getByField(entity, search);
  }

  getById<T = any>(entity: string, id: number | string): Promise<T> {
    return this.databaseAdapter.getById(entity, id);
  }

  getFirst<T = any>(entity: string): Promise<T> {
    return this.databaseAdapter.getFirst(entity);
  }

  raw<T = any>(options: any): Promise<T> {
    return this.databaseAdapter.raw(options);
  }

  registerCreateMiddleware(middleware: (entity: string, data: UpsertData) => void): void {
    return this.databaseAdapter.registerCreateMiddleware(middleware);
  }

  registerDeleteMiddleware(middleware: (entity: string, id: (number | string)) => void): void {
    return this.databaseAdapter.registerDeleteMiddleware(middleware);
  }

  registerUpdateMiddleware(middleware: (entity: string, id: (number | string), data: UpsertData) => void): void {
    return this.databaseAdapter.registerUpdateMiddleware(middleware);
  }

  update<T = any>(entity: string, id: number | string, data: UpsertData): Promise<T> {
    return this.databaseAdapter.update(entity, id, data);
  }

  upsert<T = any>(entity: string, search: Record<string, any>, data: UpsertData): Promise<T> {
    return this.databaseAdapter.upsert(entity, search, data);
  }
}