import {SqliteAdapterOptions} from "./interfaces/sqlite-adapter-options";
import BetterSqlite, {Database} from "better-sqlite3";
import {
  DefineEntityOptions,
  EntitySchema,
  SchemaType,
  UpsertData,
  DatabaseAdapter, FieldType
} from "@simpx/sync-core/src/interfaces/database-adapter";
import {SQLiteRawOptions} from "./interfaces/sqlite-raw-options";
import {SQLiteDataConverterEngine} from "./sqlite-data-converter-engine";

export class SqliteAdapter implements DatabaseAdapter {
  private readonly connectionPath: string;
  private connection: Database;

  private createMiddlewares = [];
  private updateMiddlewares = [];
  private deleteMiddlewares = [];

  converter = new SQLiteDataConverterEngine();

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

  async createIfNotExists(entity: string, keyFields: Record<string, any>, data: UpsertData) {
    await this.runMiddlewares('create');
    const formattedFields = this.formatInsertFields(data);
    const formattedData = this.formatInsertData(data);

    const result = this.connection.prepare(`INSERT INTO ${entity}${formattedFields} VALUES (${formattedData}) ON CONFLICT(${keyFields.join(",")}) DO NOTHING`).run();

    if (result.changes === 0) {
      return this.getByField(entity, keyFields.reduce((acc, field) => ({ ...acc, [field]: data[field] }), {}));
    }

    return this.getById(entity, result.lastInsertRowid as number);
  }

  async create(entity: string, data: UpsertData) {
    await this.runMiddlewares('create');
    const formattedFields = this.formatInsertFields(data);
    const formattedData = this.formatInsertData(data);

    const result = this.connection.prepare(`INSERT INTO ${entity}${formattedFields} VALUES (${formattedData})`).run();
    return this.getById(entity, result.lastInsertRowid as number);
  }

  async update(entity: string, id: number, data: UpsertData) {
    await this.runMiddlewares('update');
    const formattedData = this.formatUpdateData(data);

    this.connection.prepare(`UPDATE ${entity} SET ${formattedData} WHERE id = ?`).run(id);

    return this.getById(entity, id);
  }

  async delete(entity: string, id: number) {
    await this.runMiddlewares('delete');
    const returnValue = this.connection.prepare(`DELETE FROM ${entity} WHERE id = ?`).run(id);
    return { wasDeleted: returnValue?.changes > 0 };
  }

  async deleteByField(entity: string, mapping: Record<string, any>) {
    const formattedMapping = this.formatSelectMapping(mapping);
    const returnValue = this.connection.prepare(`DELETE FROM ${entity} WHERE ${formattedMapping}`).run();
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

  async defineEntity(entity: string, schema: EntitySchema, options: DefineEntityOptions = {}) {
    await this.raw({
      sql: `CREATE TABLE IF NOT EXISTS ${entity} (${this.formatSchema(schema)}${this.formatUniques(options?.unique)});`,
      params: [],
    });
  }

  async upsert<T = any>(entity: string, search: Record<string, any>, data: UpsertData): Promise<T> {
    const found = await this.getByField(entity, search);

    if (found) {
      return this.update(entity, found.id, data);
    } else {
      return this.create(entity, data);
    }
  }

  private formatSchema(schema: EntitySchema) {
    const INITIAL = "id INTEGER PRIMARY KEY AUTOINCREMENT";

    const stringifiedSchema = Object.entries(schema).reduce<string>((acc, [key, value]) => {
      return `${acc}, ${key} ${this.formatType(value)}`
    }, INITIAL)

    return `${stringifiedSchema} ${this.generateForeignKeys(schema)}`
  }

  private formatUniques(uniques?: string[]) {
    if (!uniques) {
      return ""
    }

    return `, UNIQUE(${uniques.join(",")})`
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
      const isConnectionType = typeof type === "object";
      if (isConnectionType) {
        return `INTEGER`
      }

      const bindings: Record<keyof FieldType, string> = {
        [SchemaType.String]: "TEXT",
        [SchemaType.Float]: "REAL",
        [SchemaType.Integer]: "INTEGER",
        [SchemaType.Boolean]: "TINYINT(1)",
        [SchemaType.Date]: "DATETIME",
        [SchemaType.Json]: "TEXT",
        [SchemaType.Id]: "INTEGER",
      } as const;

      return bindings[type as keyof typeof bindings];
  }

  private async runMiddlewares(action: 'create' | 'update' | 'delete') {
    const middlewaresByAction = {
      "create": this.createMiddlewares,
      "update": this.updateMiddlewares,
      "delete": this.deleteMiddlewares,
    }

    for await (const middleware of middlewaresByAction[action]) {
      await middleware();
    }
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
      return `${acc}${key} = ${this.applyQuotes(value)}${this.applyComma(data, index)}`
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