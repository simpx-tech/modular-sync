// TODO implement the adapter for this (will be around the dbAdapter)
export enum DynamicFieldsStrategy {
  /**
   * Store all dynamic fields inside a single field
   * (example: a Stringified JSON if SQLite or `Mixed` if MongoDB)
   */
  Unified = "unified",

  /**
   * Store dynamic fields on a separated entity.
   * Create one register per dynamic field
   */
  Separated = "separated",
}