import {EntitySchema} from "../interfaces/database-adapter";
import {DataConverterEngine} from "../interfaces/data-converter-engine";
import {isOperationValue, MatchValue, Query} from "../interfaces/query";

// TODO add typescript type to query
// TODO add test
export class QueryBuilder<TSchema extends EntitySchema = any> {
  private readonly query: Query<TSchema> = { entity: "" };
  private ignoreDeleted = true;

  constructor(entitiy: string, private readonly converter?: DataConverterEngine, private readonly schema?: TSchema) {
    this.query.match = {} as Record<keyof TSchema, MatchValue>;
    this.query.entity = entitiy;
  }

  withId(id: string | number) {
    this.query.match = { id } as Record<keyof TSchema, MatchValue>;
    this.fetchOne();
    return this;
  }

  selectFields(fields: (keyof TSchema)[]) {
    this.query.fields = fields;
    return this;
  }

  where(mapping: Partial<Record<keyof TSchema, MatchValue>>) {
    const convertedMapping = { ...mapping };

    if (this.canConvert()) {
      for (const key in convertedMapping) {
        const currentValue = convertedMapping[key];

        const isOperationWithValue = isOperationValue(currentValue) && currentValue.value;
        if (isOperationWithValue) {
          currentValue.value = this.converter.inbound.convertField(key, currentValue.value, this.schema);
        } else {
          convertedMapping[key] = this.converter.inbound.convertField(key, convertedMapping[key], this.schema);
        }
      }
    }

    this.query.match = convertedMapping;

    return this;
  }

  canConvert() {
    return this.converter && this.schema;
  }

  fetchOne() {
    this.query.one = true;
    return this;
  }

  isFetchOne() {
    return this.query.one;
  }

  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  includeDeleted() {
    this.ignoreDeleted = false;
    return this;
  }

  startFrom(skip: number) {
    this.query.skip = skip;
    return this;
  }

  orderBy(...orderByField: Record<keyof TSchema, any>[]) {
    this.query.orderBy = orderByField;
    return this;
  }

  build() {
    if (!this.ignoreDeleted && this.schema.wasDeleted) {
      this.query.match["wasDeleted" as keyof TSchema] = false;
    }

    return this.query;
  }
}