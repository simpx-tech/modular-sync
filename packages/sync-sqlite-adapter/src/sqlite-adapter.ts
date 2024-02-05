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
import {QueryBuilder} from "@simpx/sync-core/src/common/query-builder";
import {QueryBuilderTransformer} from "./query-builder-transformer";

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

  async connect() {
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

  // TODO test ignored deleted entities
  async query(builder: QueryBuilder): Promise<any> {
    const { sql, params} = new QueryBuilderTransformer(builder).transform();

    if (builder.isFetchOne()) {
      return this.connection.prepare(sql).get(...params);
    } else {
      return this.connection.prepare(sql).all(...params);
    }
  }

  async createIfNotExists(entity: string, keyFields: Record<string, any>, data: UpsertData) {
    await this.runMiddlewares('create');
    const formattedFields = this.formatInsertFields(data);
    const formattedData = this.formatInsertData(data);

    const result = this.connection.prepare(`INSERT INTO ${entity} ${formattedFields.sql} VALUES (${formattedData.sql}) ON CONFLICT(${keyFields.join(",")}) DO NOTHING`).run(...formattedFields.params, ...formattedData.params);

    if (result.changes === 0) {
      const updatedFields = keyFields.reduce((acc, field) => ({ ...acc, [field]: data[field] }), {});
      return this.query(new QueryBuilder(entity).where(updatedFields).fetchOne())
    }

    return this.query(new QueryBuilder(entity).withId(result.lastInsertRowid as number));
  }

  async create(entity: string, data: UpsertData) {
    await this.runMiddlewares('create');
    const formattedFields = this.formatInsertFields(data);
    const formattedData = this.formatInsertData(data);

    const result = this.connection.prepare(`INSERT INTO ${entity}${formattedFields.sql} VALUES (${formattedData.sql})`).run(...formattedFields.params, ...formattedData.params);
    return this.query(new QueryBuilder(entity).withId(result.lastInsertRowid as number));
  }

  // TODO ignore deleted entities
  async update(entity: string, id: number, data: UpsertData) {
    await this.runMiddlewares('update');
    const { sql, params } = this.formatUpdateData(data);

    this.connection.prepare(`UPDATE ${entity} SET ${sql} WHERE id = ?`).run(...params, id);

    return this.query(new QueryBuilder(entity).withId(id));
  }

  // TODO ignore deleted entities
  // TODO add tests
  async updateByField(entity: string, mapping: Record<string, any>, data: UpsertData) {
    const formattedMapping = this.formatWhereMapping(mapping);
    const formattedData = this.formatUpdateData(data);

    // TODO should update only one?
    this.connection.prepare(`UPDATE ${entity} SET ${formattedData.sql} WHERE ${formattedMapping.sql}`).run(...formattedData.params, ...formattedData.params);

    return this.query(new QueryBuilder(entity).where(mapping).fetchOne());
  }

  // TODO use soft delete (update) instead of this
  async delete(entity: string, id: number) {
    await this.runMiddlewares('delete');
    const returnValue = this.connection.prepare(`DELETE FROM ${entity} WHERE id = ?`).run(id);
    return { wasDeleted: returnValue?.changes > 0 };
  }

  // TODO add test
  async deleteByField(entity: string, mapping: Record<string, any>) {
    const formattedMapping = this.formatWhereMapping(mapping);
    const returnValue = this.connection.prepare(`DELETE FROM ${entity} WHERE ${formattedMapping.sql}`).run(...formattedMapping.params);
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
    const found = await this.query(new QueryBuilder(entity).where(search).fetchOne());

    if (found) {
      return this.update(entity, found.id, data);
    } else {
      return this.create(entity, data);
    }
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

  private formatWhereMapping(mapping: Record<string, any>) {
    const sql = Object.keys(mapping).map((key) => `${key} = ?`).join(" AND ");
    const params = Object.values(mapping).map((value) => this.formatValue(value, { useIsNull: true }));

    return { sql, params };
  }

  private formatValue(value: any, config: { useIsNull?: boolean } = {}) {
    if (value === null) {
      return config.useIsNull ? "IS NULL" : "NULL";
    }

    return value;
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

  // TODO sanitize, return sql + params
  private formatInsertFields(data: UpsertData) {
    const fields = Object.keys(data);
    return { sql: `(${fields.join(", ")})`, params: [] };
  }

  private formatInsertData(data: UpsertData) {
    const values = Object.values(data).map(value => this.formatValue(value));
    const sql = values.map(_ => "?").join(", ");

    return { sql, params: values };
  }

  private formatUpdateData(data: UpsertData) {
    const sql = Object.keys(data).map(key => `${key} = ?`).join(", ");
    const values = Object.values(data).map(value => this.formatValue(value));

    return { sql, params: values }
  }
}