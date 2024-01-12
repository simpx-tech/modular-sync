export interface DomainEntity {
  id: string | number;
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
