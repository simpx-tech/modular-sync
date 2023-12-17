export interface CreateRepository {
  user: number | string;
  name: string;
}

export interface RepositoryEntity {
  name: string;
  user: number | string;
}