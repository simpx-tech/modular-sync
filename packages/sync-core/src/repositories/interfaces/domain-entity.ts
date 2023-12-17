export interface DomainEntity {
  name: string;
  repository: number | string;
  isMigrated: boolean;
  user: number | string;
}

export interface CreateDomain {
  name: string;
  repository: number | string;
  isMigrated: boolean;
  user: number | string;
}

export interface UpdateDomain {
  name?: string;
  repository?: number | string;
  isMigrated?: boolean;
}