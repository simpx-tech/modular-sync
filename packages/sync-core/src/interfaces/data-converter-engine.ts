export interface DataConverterEngine {
  /**
   * When converting from client to the database
   */
  inbound: DataConverterMapping;
  /**
   * When converting from a database to the client
   */
  outbound: DataConverterMapping;
}

export interface DataConverterMapping {
  toString(field: unknown): any;
  toInt(field: unknown): any;
  toFloat(field: unknown): any;
  toBoolean(field: unknown): any;
  toDate(field: unknown): any;
  toConnection(field: unknown): any;
}