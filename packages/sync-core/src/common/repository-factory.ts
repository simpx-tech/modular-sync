import {
  DefineEntityOptions, DatabaseAdapter,
  EntitySchema,
} from "../interfaces/database-adapter";
import {RepositoryBase} from "./repository-base";

export class RepositoryFactory {
  static create<
    TEntity extends { id: string | number } = undefined,
    TCreate extends Record<string, any> = undefined,
    TUpdate extends Record<string, any> = undefined,
    TSchema extends EntitySchema = undefined,
  >(entityName: string, schema: TSchema, schemaOptions?: DefineEntityOptions) {
    return new RepositoryBase<TEntity, TCreate, TUpdate, TSchema>(entityName, schema, schemaOptions);
  }
}