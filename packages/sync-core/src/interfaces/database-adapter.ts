import {DataConverterEngine} from "./data-converter-engine";
import {QueryBuilder} from "../common/query-builder";

export interface DatabaseAdapter<TId = number | string> {
  converter: DataConverterEngine;

  // Should allow calling it twice without causing error
  connect(): Promise<void>;
  // Should allow calling it twice without causing error
  disconnect(): Promise<void>;

  /**
   * Performs a query on database using the QueryBuilder instance
   *
   * Entity name is inside the QueryBuilder
   * @param builder
   */
  query(builder: QueryBuilder): Promise<any | any[]>;
  create<T = any>(entity: string, data: UpsertData): Promise<T>;
  createIfNotExists<T = any>(entity: string, keyFields: string[], data: UpsertData): Promise<T>;
  update<T = any>(entity: string, id: TId, data: UpsertData): Promise<T>;
  updateByField<T = any>(entity: string, mapping: Record<string, any>, data: UpsertData): Promise<T>;
  upsert<T = any>(entity: string, search: Record<string, any>, data: UpsertData): Promise<T>;

  // TODO should do soft delete
  delete(entity: string, id: TId): Promise<WasDeleted>;
  deleteByField(entity: string, mapping: Record<string, any>): Promise<WasDeleted>;
  raw<T = any>(options: any): Promise<T>;

  // Should allow calling it twice without causing error
  defineEntity(entity: string, schema: EntitySchema, options?: DefineEntityOptions): Promise<void>;

  registerCreateMiddleware(middleware: ((entity: string, data: UpsertData) => void)): void;
  registerUpdateMiddleware(middleware: ((entity: string, id: TId, data: UpsertData) => void)): void;
  registerDeleteMiddleware(middleware: ((entity: string, id: TId) => void)): void;
}

export interface DefineEntityOptions {
  // TODO make the unique to only accept the fields that are defined in the schema
  // TODO allow setup many unique fields
  unique?: string[];

  /**
   * Remove all metadata fields from the entity
   */
  isToIgnoreSyncFields?: boolean;

  // TODO add indexes
}

export interface WasDeleted {
  wasDeleted?: boolean;
}

export type UpsertData = Record<string, string | number | boolean>

// TODO include options like required and default
export type EntitySchema = Record<string, FieldType>

export type ConnectionField = { type: string, entity: string }

export type FieldLiteralType = "string" | "integer" | "float" | "boolean" | "date" | "json" | "id" | "stringified"

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
  static Stringified = "stringified" as const;

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