import {SqliteAdapterOptions} from "./interfaces/sqlite-adapter-options";
import BetterSqlite, {Database} from "better-sqlite3";
import {DatabaseAdapter, UpsertData} from "@simpx/sync-core/src/interfaces/database-adapter";
import {SQLiteRawOptions} from "./interfaces/sqlite-raw-options";

export class SqliteAdapter implements DatabaseAdapter {
  private readonly connectionPath: string;
  private connection: Database;

  private createMiddlewares = [];
  private updateMiddlewares = [];
  private deleteMiddlewares = [];

  constructor(options?: SqliteAdapterOptions) {
    this.connectionPath = options.databasePath
  }

  async connect(){
    this.connection = new BetterSqlite(this.connectionPath);
  };

  async disconnect() {
    this.connection.close();
  };

  async getFirst<T = any>(entity: string): Promise<T> {
    return this.connection.prepare(`SELECT * FROM ? LIMIT 1`).get(entity) as T;
  }

  async getById<T = any>(entity: string, id: number): Promise<T> {
    return this.connection.prepare(`SELECT * FROM ? WHERE id = ?`).get(entity, id) as T;
  }

  async getAll<T = any>(entity: string): Promise<T> {
    return this.connection.prepare(`SELECT * FROM ?`).all(entity) as T;
  }

  async getByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T> {
    const formattedMapping = this.formatSelectMapping(mapping);
    return this.connection.prepare(`SELECT * FROM ? WHERE ?`).all(entity, formattedMapping) as T;
  }

  private formatSelectMapping(mapping: Record<string, any>) {
    return Object.entries(mapping).reduce((acc, [key, value]) => {
      return `${acc}, ${key} = ${value}`
    }, "")
  }

  async create(entity: string, data: UpsertData) {
    const formattedData = this.formatInsertData(data);
    this.connection.prepare(`INSERT INTO ? VALUES (?)`).run(entity, formattedData);
  }

  async update(entity: string, id: number, data: UpsertData) {
    const formattedData = this.formatUpdateData(data);
    this.connection.prepare(`UPDATE ? SET ? WHERE id = ?`).run(entity, formattedData, id);
  }

  async delete(entity: string, id: number) {
    this.connection.prepare(`DELETE FROM ? WHERE id = ?`).run(entity, id);
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

  private formatInsertData(data: UpsertData) {
    return Object.entries(data).reduce<string>((acc, [key, value]) => {
      return `${acc}, ${value}`
    }, "")
  }

  private formatUpdateData(data: UpsertData) {
    return Object.entries(data).reduce<string>((acc, [key, value]) => {
      return `${acc}, ${key} = ${value}`
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