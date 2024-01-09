import {SchemaType, UpsertData, WasDeleted} from "./database-adapter";
import {ServerSyncEngine} from "../server/server-sync-engine";

type TypeBySchemaType = {
  [SchemaType.String]: string;
  [SchemaType.Integer]: number;
  [SchemaType.Float]: number;
  [SchemaType.Boolean]: boolean;
  [SchemaType.Date]: Date;
}

export type MapSchemaToType<TSchema extends Record<string, any>> = {
  [K in keyof TSchema]: TSchema[K] extends { type: "connection", entity: string } ? string | number : TypeBySchemaType[TSchema[K]]
}

export interface Repository<
  TSchema extends Record<string, any>,
  TEntity extends Record<string, any> = undefined,
  TCreate extends Record<string, any> = undefined,
  TUpdate extends Record<string, any> = undefined
> {
  runSetup(syncEngine: ServerSyncEngine): Promise<void>;
  getFirst(): Promise<UseAOrB<TEntity, TSchema>>;
  getById(id: number | string): Promise<UseAOrB<TEntity, TSchema>>;
  getByField(mapping: Record<string, any>): Promise<UseAOrB<TEntity, TSchema>>;
  getAllByField(mapping: Record<string, any>): Promise<UseAOrB<TEntity, TSchema>>;
  getAll(): Promise<UseAOrB<TEntity, TSchema>>;
  create(data: UseAOrB<TCreate, UpsertData>): Promise<UseAOrB<TEntity, TSchema>>;
  createIfNotExists(keyFields: string[], data: UseAOrB<TCreate, UpsertData>): Promise<UseAOrB<TEntity, TSchema>>;
  update(id: number | string, data: UseAOrB<TUpdate, UpsertData>): Promise<UseAOrB<TEntity, TSchema>>;
  delete(id: number | string): Promise<WasDeleted>;
  deleteByField(mapping: Record<string, any>): Promise<WasDeleted>;
  registerCreateMiddleware(middleware: ((data: UseAOrB<TCreate, UpsertData>) => void)): void;
  registerUpdateMiddleware(middleware: ((id: string | number, data: UseAOrB<TUpdate, UpsertData>) => void)): void;
  registerDeleteMiddleware(middleware: ((id: string | number) => void)): void;
}