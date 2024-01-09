import {EntitySchema, SchemaType, TestFieldType, UpsertData, WasDeleted} from "./database-adapter";
import {ServerSyncEngine} from "../server/server-sync-engine";
import {ServerDomain} from "../server/server-domain";

type TypeBySchemaType = {
  [SchemaType.String]: string;
  [SchemaType.Integer]: number;
  [SchemaType.Float]: number;
  [SchemaType.Boolean]: boolean;
  [SchemaType.Date]: Date;
}

export type MapSchemaToType<TSchema extends EntitySchema> = {
  [K in keyof TSchema]: TSchema[K] extends { type: "connection", entity: string } ? string | number : TSchema[K] extends "string" | "integer" | "float" | "boolean" | "date" ? TypeBySchemaType[TSchema[K]] : never
}

// TODO TSchema should also include id field
export interface Repository<
  TSchema extends Record<string, any>,
  TEntity extends Record<string, any> = undefined,
  TCreate extends Record<string, any> = undefined,
  TUpdate extends Record<string, any> = undefined
> {
  runSetup(domain: ServerDomain, syncEngine: ServerSyncEngine): Promise<void>;
  getFirst(): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>>;
  getById(id: number | string): Promise<UseAOrB<TEntity, TSchema>>;
  getByField(mapping: Record<string, any>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>>;
  getAllByField(mapping: Record<string, any>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>>;
  getAll(): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>>;
  create(data: UseAOrB<TCreate, Partial<MapSchemaToType<TSchema>>>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>>;
  createIfNotExists(keyFields: string[], data: UseAOrB<TCreate, UpsertData>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>>;
  update(id: number | string, data: UseAOrB<TUpdate, UpsertData>): Promise<UseAOrB<TEntity, MapSchemaToType<TSchema>>>;
  delete(id: number | string): Promise<WasDeleted>;
  deleteByField(mapping: Record<string, any>): Promise<WasDeleted>;
  registerCreateMiddleware(middleware: ((data: UseAOrB<TCreate, UpsertData>) => void)): void;
  registerUpdateMiddleware(middleware: ((id: string | number, data: UseAOrB<TUpdate, UpsertData>) => void)): void;
  registerDeleteMiddleware(middleware: ((id: string | number) => void)): void;
}