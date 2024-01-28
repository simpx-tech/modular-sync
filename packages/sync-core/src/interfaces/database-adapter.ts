import {DataConverterEngine} from "./data-converter-engine";

export interface DatabaseAdapter<TId = number | string> {
  converter: DataConverterEngine;

  // Should allow calling it twice without causing error
  connect(): Promise<void>;
  // Should allow calling it twice without causing error
  disconnect(): Promise<void>;
  getFirst<T = any>(entity: string): Promise<T>;
  getById<T = any>(entity: string, id: TId): Promise<T>;
  getByField<T = any>(entity: string, search: Record<string, any>): Promise<T>;
  getAllByField<T = any>(entity: string, search: Record<string, any>): Promise<T>;
  getAll<T = any>(entity: string): Promise<T>;
  create<T = any>(entity: string, data: UpsertData): Promise<T>;
  createIfNotExists<T = any>(entity: string, keyFields: string[], data: UpsertData): Promise<T>;
  update<T = any>(entity: string, id: TId, data: UpsertData): Promise<T>;
  upsert<T = any>(entity: string, search: Record<string, any>, data: UpsertData): Promise<T>;

  // TODO should do soft delete
  delete(entity: string, id: TId): Promise<WasDeleted>;
  deleteByField(entity: string, mapping: Record<string, any>): Promise<WasDeleted>;
  raw<T = any>(options: any): Promise<T>;

  // Should allow calling it twice without causing error
  createEntity(entity: string, schema: EntitySchema, options?: CreateEntityOptions): Promise<void>;

  registerCreateMiddleware(middleware: ((entity: string, data: UpsertData) => void)): void;
  registerUpdateMiddleware(middleware: ((entity: string, id: TId, data: UpsertData) => void)): void;
  registerDeleteMiddleware(middleware: ((entity: string, id: TId) => void)): void;
}

export interface CreateEntityOptions {
  unique?: string[];

  /**
   * Remove all metadata fields from the entity
   */
  noSyncFields?: boolean;

  // TODO add indexes
}

export interface WasDeleted {
  wasDeleted?: boolean;
}

export type UpsertData = Record<string, string | number | boolean>

export type EntitySchema = Record<string, FieldType>

export type ConnectionField = { type: string, entity: string }

export type FieldLiteralType = "string" | "integer" | "float" | "boolean" | "date" | "json" | "id"

export type FieldType = FieldLiteralType | ConnectionField;

export class SchemaType {
  /**
   * The `Id` will be used to identify an entity, it will not create the connection (as a foreign key)
   * automatically
   * @see Connection
   */
  static Id = "id" as const;
  static String = "string" as const;
  static Integer = "integer" as const;
  static Float = "float" as const;
  static Boolean = "boolean" as const;
  static Date = "date" as const;
  static Json = "json" as const;

  /**
   * Connects to an entity, similar to `Id` but it will be used to create a connection between
   * two entities, while the `Id` will not
   * @param entity
   * @constructor
   */
  static Connection = (entity: string): ConnectionField => ({
    type: "connection",
    entity,
  });
}