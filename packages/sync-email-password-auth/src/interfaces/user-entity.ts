export interface UserEntity {
  id: string | number;
  email: string;
  password: string;
  salt: string;
  syncActivated: boolean;
  createdAt: string;
  updatedAt: string;
}