import { IRole } from "../entities/Role";

export interface IRoleRepository {
  create(role: IRole): Promise<IRole>;
  findById(id: number): Promise<IRole | null>;
  findBySlug(slug: string): Promise<IRole | null>;
  findAll(params?: {
    skip?: number;
    limit?: number;
    status?: boolean;
  }): Promise<IRole[]>;
  update(id: number, role: Partial<IRole>): Promise<IRole | null>;
  delete(id: number): Promise<boolean>;
  count(params?: { status?: boolean }): Promise<number>;
  assignPermissions(roleId: number, permissionIds: number[]): Promise<IRole | null>;
  removePermissions(roleId: number, permissionIds: number[]): Promise<IRole | null>;
}


