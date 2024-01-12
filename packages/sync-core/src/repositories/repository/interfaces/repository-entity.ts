export interface CreateRepository {
  user: number | string;
  name: string;
}

export interface RepositoryEntity {
  id: number | string;
  name: string;
  user: number | string;
}