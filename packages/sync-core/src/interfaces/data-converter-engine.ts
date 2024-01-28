import {EntitySchema, FieldLiteralType} from "./database-adapter";

export interface DataConverterEngine {
  /**
   * When converting from client to the database
   */
  inbound: DataConverterFlow;
  /**
   * When converting from a database to the client
   */
  outbound: DataConverterFlow;
}

export type DataConverterFlow = {
  convert(obj: Record<string, any>, schema: EntitySchema): any;
} & {
  [K in (FieldLiteralType | "connection") as `as${Capitalize<K>}`]: (data: unknown) => any;
}