import {EntitySchema} from "./database-adapter";

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

export interface DataConverterFlow {
  toString(field: unknown): any;
  toInt(field: unknown): any;
  toFloat(field: unknown): any;
  toBoolean(field: unknown): any;
  toDate(field: unknown): any;
  toConnection(field: unknown): any;
  convert(obj: Record<string, unknown>, schema: EntitySchema): any;
}