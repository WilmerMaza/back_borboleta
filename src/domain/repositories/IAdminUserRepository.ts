import { IAdminUser, AdminUserCreateRequest, AdminUserUpdateRequest } from '../entities/AdminUser';

export interface IAdminUserRepository {
  create(adminUser: AdminUserCreateRequest): Promise<IAdminUser>;
  findById(id: number): Promise<IAdminUser | null>;
  findByEmail(email: string): Promise<IAdminUser | null>;
  findByEmployeeId(employeeId: string): Promise<IAdminUser | null>;
  findAll(params: { skip: number; limit: number; department?: string; role?: string; status?: boolean; search?: string; field?: string; sort?: string }): Promise<IAdminUser[]>;
  update(id: number, adminUser: AdminUserUpdateRequest): Promise<IAdminUser | null>;
  updatePassword(id: number, newPassword: string): Promise<IAdminUser | null>;
  delete(id: number): Promise<boolean>;
  count(params?: { role?: string }): Promise<number>;
  findByRole(roleId: number): Promise<IAdminUser[]>;
  findByDepartment(department: string): Promise<IAdminUser[]>;
  updateLastLogin(id: number): Promise<void>;
  incrementLoginAttempts(id: number): Promise<void>;
  resetLoginAttempts(id: number): Promise<void>;
  lockAccount(id: number, lockUntil: Date): Promise<void>;
  unlockAccount(id: number): Promise<void>;
}




