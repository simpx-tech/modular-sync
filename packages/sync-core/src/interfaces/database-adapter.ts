export interface DatabaseAdapter {
  // Should allow calling it twice without causing error
  connect(): Promise<void>;
  // Should allow calling it twice without causing error
  disconnect(): Promise<void>;
  getFirst<T = any>(entity: string): Promise<T>;
  getById<T = any>(entity: string, id: number | string): Promise<T>;
  getByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T>;
  getAllByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T>;
  getAll<T = any>(entity: string): Promise<T>;
  create(entity: string, data: UpsertData): Promise<void>;
  update(entity: string, id: number | string, data: UpsertData): Promise<void>;
  delete(entity: string, id: number | string): Promise<WasDeleted>;
  deleteByField(entity: string, mapping: Record<string, any>): Promise<WasDeleted>;
  raw<T = any>(options: any): Promise<T>;

  // Should allow calling it twice without causing error
  createEntity(entity: string, schema: EntitySchema): Promise<void>;

  registerCreateMiddleware(middleware: ((entity: string, data: UpsertData) => void)): void;
  registerUpdateMiddleware(middleware: ((entity: string, id: string | number, data: UpsertData) => void)): void;
  registerDeleteMiddleware(middleware: ((entity: string, id: string | number) => void)): void;
}

export interface WasDeleted {
  wasDeleted?: boolean;
}

export type UpsertData = Record<string, string | number | boolean>

export type EntitySchema = Record<string, "string" | "integer" | "float" | "boolean" | "date" | { type: string, entity: string }>

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