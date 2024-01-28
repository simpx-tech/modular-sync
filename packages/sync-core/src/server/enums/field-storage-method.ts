export enum FieldStorageMethod {
  /**
   * Stores all fields in the same table. Recommended for database sync
   */
  Unified = "unified",

  /**
   * Create one register per field.
   * Recommended for dynamic fields,
   * like text files (each line is a field)
   */
  Separated = "separated",
}