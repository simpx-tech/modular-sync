export enum FieldStorageMethod {
  /**
   * Stores all fields in the same table. Recommended for database sync
   */
  Unified = "unified",

  /**
   * Create one row per field. Recommended for dynamic fields,
   * like text files
   */
  Individual = "individual",
}