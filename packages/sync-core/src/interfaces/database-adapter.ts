import {DataConverterEngine} from "./data-converter-engine";

export interface DatabaseAdapter {
  converter: DataConverterEngine;

  // Should allow calling it twice without causing error
  connect(): Promise<void>;
  // Should allow calling it twice without causing error
  disconnect(): Promise<void>;
  getFirst<T = any>(entity: string): Promise<T>;
  getById<T = any>(entity: string, id: number | string): Promise<T>;
  getByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T>;
  getAllByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T>;
  getAll<T = any>(entity: string): Promise<T>;
  create<T = any>(entity: string, data: UpsertData): Promise<T>;
  createIfNotExists<T = any>(entity: string, keyFields: string[], data: UpsertData): Promise<T>;
  update<T = any>(entity: string, id: number | string, data: UpsertData): Promise<T>;
  delete(entity: string, id: number | string): Promise<WasDeleted>;
  deleteByField(entity: string, mapping: Record<string, any>): Promise<WasDeleted>;
  raw<T = any>(options: any): Promise<T>;

  // Should allow calling it twice without causing error
  createEntity(entity: string, schema: EntitySchema, options?: CreateEntityOptions): Promise<void>;

  registerCreateMiddleware(middleware: ((entity: string, data: UpsertData) => void)): void;
  registerUpdateMiddleware(middleware: ((entity: string, id: string | number, data: UpsertData) => void)): void;
  registerDeleteMiddleware(middleware: ((entity: string, id: string | number) => void)): void;
}

export interface CreateEntityOptions {
  unique?: string[];
  // TODO add indexes
}

export interface WasDeleted {
  wasDeleted?: boolean;
}

export type UpsertData = Record<string, string | number | boolean>

export type EntitySchema = Record<string, FieldType>

export type FieldType = "string" | "integer" | "float" | "boolean" | "date" | { type: string, entity: string };

export class SchemaType {
  static String = "string" as const;
  static Integer = "integer" as const;
  static Float = "float" as const;
  static Boolean = "boolean" as const;
  static Date = "date" as const;

  static Connection = (entity: string) => ({
    type: "connection",
    entity,
  });
}