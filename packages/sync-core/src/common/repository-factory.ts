import {
  CreateEntityOptions, DatabaseAdapter,
  EntitySchema,
} from "../interfaces/database-adapter";
import {RepositoryBase} from "./repository-base";

export class RepositoryFactory {
  static create<
    TDatabase extends DatabaseAdapter,
    TEntity extends Record<string, any> = undefined,
    TCreate extends Record<string, any> = undefined,
    TUpdate extends Record<string, any> = undefined,
    TSchema extends EntitySchema = undefined,
  >(entityName: string, schema: TSchema, schemaOptions?: CreateEntityOptions) {
    return new RepositoryBase<TDatabase, TEntity, TCreate, TUpdate, TSchema>(entityName, schema, schemaOptions);
  }
}