import {EntitySchema} from "../interfaces/database-adapter";

export class RepositoryBase<TEntity extends EntitySchema> {
  schema: EntitySchema;

  constructor(schema: TEntity) {
    this.schema = schema;
  }
}