import {SqliteAdapterOptions} from "./interfaces/sqlite-adapter-options";
import BetterSqlite, {Database} from "better-sqlite3";
import {DatabaseAdapter, EntitySchema, SchemaType, UpsertData} from "@simpx/sync-core/src/interfaces/database-adapter";
import {SQLiteRawOptions} from "./interfaces/sqlite-raw-options";

export class SqliteAdapter implements DatabaseAdapter {
  private readonly connectionPath: string;
  private connection: Database;

  private createMiddlewares = [];
  private updateMiddlewares = [];
  private deleteMiddlewares = [];

  constructor(options: SqliteAdapterOptions) {
    this.connectionPath = options.databasePath
  }

  async connect(){
    if (!this.connection) {
      this.connection = new BetterSqlite(this.connectionPath);
    }
  };

  async disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = undefined;
    }
  };

  async getFirst<T = any>(entity: string): Promise<T> {
    return this.connection.prepare(`SELECT * FROM ${entity} LIMIT 1`).get() as T;
  }

  async getById<T = any>(entity: string, id: number): Promise<T> {
    return this.connection.prepare(`SELECT * FROM ${entity} WHERE id = ?`).get(id) as T;
  }

  async getAll<T = any>(entity: string): Promise<T> {
    return this.connection.prepare(`SELECT * FROM ${entity}`).all() as T;
  }

  async getByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T> {
    const formattedMapping = this.formatSelectMapping(mapping);
    console.log(`SELECT * FROM ${entity} WHERE ${formattedMapping}`);
    return this.connection.prepare(`SELECT * FROM ${entity} WHERE ${formattedMapping}`).get() as T;
  }

  async getAllByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T> {
    const formattedMapping = this.formatSelectMapping(mapping);
    return this.connection.prepare(`SELECT * FROM ${entity} WHERE ${formattedMapping}`).all() as T;
  }

  private formatSelectMapping(mapping: Record<string, any>) {
    return Object.entries(mapping).reduce((acc, [key, value], index) => {
      return `${acc}${key} = ${this.applyQuotes(value)}${this.applyAnd(mapping, index)}`
    }, "")
  }

  private applyAnd(mapping: Record<string, any>, index: number) {
    return `${index !== Object.keys(mapping).length - 1 ? " AND " : ""}`;
  }

  private applyQuotes(value: any) {
    return typeof value === "string" ? `'${value}'` : value;
  }

  private applyComma(mapping: Record<string, any>, index: number){
    return `${index !== Object.keys(mapping).length - 1 ? ", " : ""}`;
  }

  async create(entity: string, data: UpsertData) {
    const formattedFields = this.formatInsertFields(data);
    const formattedData = this.formatInsertData(data);
    this.connection.prepare(`INSERT INTO ${entity}${formattedFields} VALUES (${formattedData})`).run();
  }

  async update(entity: string, id: number, data: UpsertData) {
    const formattedData = this.formatUpdateData(data);
    console.log("update", `UPDATE ${entity} SET ${formattedData} WHERE id = ?`)
    this.connection.prepare(`UPDATE ${entity} SET ${formattedData} WHERE id = ?`).run(id);
  }

  async delete(entity: string, id: number) {
    const returnValue = this.connection.prepare(`DELETE FROM ${entity} WHERE id = ?`).run(id);
    return { wasDeleted: returnValue?.changes > 0 };
  }

  async raw<T = any>(options: SQLiteRawOptions): Promise<T> {
    if (options.isQuery) {
      if (options.fetchAll) {
        return this.connection.prepare(options.sql).all(options.params) as T;
      } else {
        return this.connection.prepare(options.sql).get(options.params) as T;
      }
    } else {
      return this.connection.prepare(options.sql).run(options.params) as T;
    }
  }

  async createEntity(entity: string, schema: EntitySchema) {
    await this.raw({
      sql: `CREATE TABLE IF NOT EXISTS ${entity} (${this.formatSchema(schema)});`,
      params: [],
    });
  }

  private formatSchema(schema: EntitySchema) {
    const INITIAL = "id INTEGER PRIMARY KEY AUTOINCREMENT";

    const stringifiedSchema = Object.entries(schema).reduce<string>((acc, [key, value]) => {
      return `${acc}, ${key} ${this.formatType(value)}`
    }, INITIAL)

    return `${stringifiedSchema} ${this.generateForeignKeys(schema)}`
  }

  private generateForeignKeys(schema: EntitySchema) {
    return Object.entries(schema).reduce<string>((acc, [key, value]) => {
      if (typeof value === "object") {
        return `${acc}, FOREIGN KEY(${key}) REFERENCES ${value.entity}(id)`
      }

      return acc;
    }, "");
  }

  private formatType(type: SchemaType) {
      if (typeof type === "object") {
        return `INTEGER`
      }

      const bindings: Record<string, string> = {
        [SchemaType.String]: "TEXT",
        [SchemaType.Float]: "REAL",
        [SchemaType.Integer]: "INTEGER",
        [SchemaType.Boolean]: "TINYINT",
        [SchemaType.Date]: "DATETIME",
      } as const;

      return bindings[type as keyof typeof bindings];
  }

  private formatInsertFields(data: UpsertData) {
    return `(${Object.keys(data).join(", ")})`
  }

  private formatInsertData(data: UpsertData) {
    return Object.entries(data).reduce<string>((acc, [key, value], index) => {
      return `${acc}${this.applyQuotes(value)}${this.applyComma(data, index)}`
    }, "")
  }

  private formatUpdateData(data: UpsertData) {
    return Object.entries(data).reduce<string>((acc, [key, value], index) => {
      return `${acc}${key} = ${value}${this.applyComma(data, index)}`
    }, "")
  }

  registerCreateMiddleware(middleware: (entity: string, data: UpsertData) => void) {
    this.createMiddlewares.push(middleware);
  }

  registerDeleteMiddleware(middleware: (entity: string, id: string | number) => void) {
    this.deleteMiddlewares.push(middleware);
  }

  registerUpdateMiddleware(middleware: (entity: string, id: string | number, data: UpsertData) => void) {
    this.updateMiddlewares.push(middleware);
  }
}