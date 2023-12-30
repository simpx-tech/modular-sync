export interface UpsertSchemaMigrationEntity extends Omit<SchemaMigrationEntity, "id"> {}

export interface SchemaMigrationEntity {
  id: number | string;
  domain: string;
  name: string;
  migratedAt: number;
}