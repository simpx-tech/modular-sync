import {
  CreateEntityOptions,
  EntitySchema,
} from "../interfaces/database-adapter";
import {RepositoryBase} from "./repository-base";

export class RepositoryFactory {
  static create<
    TSchema extends EntitySchema,
    TEntity extends Record<string, any> = undefined,
    TCreate extends Record<string, any> = undefined,
    TUpdate extends Record<string, any> = undefined
  >(entityName: string, schema: TSchema, schemaOptions?: CreateEntityOptions) {
    return new RepositoryBase<TSchema, TEntity, TCreate, TUpdate>(entityName, schema, schemaOptions);
  }
}