export interface SQLiteRawOptions {
  sql: string;
  params: string[];
  isQuery?: boolean;
  fetchAll?: boolean;
}