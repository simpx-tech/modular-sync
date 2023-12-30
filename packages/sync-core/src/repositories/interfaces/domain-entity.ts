export interface DomainEntity {
  name: string;
  repository: number | string;
  isMigrated: boolean;
}

export interface CreateDomain {
  name: string;
  repository: number | string;
  isMigrated: boolean;
}

export interface UpdateDomain {
  isMigrated?: boolean;
}
