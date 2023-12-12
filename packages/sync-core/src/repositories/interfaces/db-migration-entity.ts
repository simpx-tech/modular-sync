export interface UpsertDbMigrationEntity extends Omit<DbMigrationEntity, "id"> {}

export interface DbMigrationEntity {
  id: number | string;
  domain: string;
  name: string;
  migratedAt: number;
}