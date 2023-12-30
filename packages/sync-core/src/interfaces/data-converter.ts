export interface DataConverterEngine {
  /**
   * When converting from client to the database
   */
  inbound: DataConverter;
  /**
   * When converting from a database to the client
   */
  outbound: DataConverter;
}

export interface DataConverter {
  toString(): void;
  toInt(): void;
  toFloat(): void;
  toBoolean(): void;
  toDate(): void;
  toConnection(): void;
}