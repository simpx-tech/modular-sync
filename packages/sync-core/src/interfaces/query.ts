export interface Query<TSchema> {
  entity: string;
  fields?: (keyof TSchema)[];
  match?: Partial<Record<keyof TSchema, MatchValue>>;
  one?: boolean;
  limit?: number;
  skip?: number;
  orderBy?: Partial<Record<keyof TSchema, "asc" | "desc">>[];
}

export type MatchValue = string | number | boolean | Date | OperationValue;

export interface OperationValue {
  type: "notEqual" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "like" | "in";
  isCustomValue?: boolean;
  operator?: string;
  value?: string | number | boolean | Date;
  params?: any[];
}

export function isOperationValue(value: MatchValue): value is OperationValue {
  return typeof value === "object" && !!(value as OperationValue).type;
}