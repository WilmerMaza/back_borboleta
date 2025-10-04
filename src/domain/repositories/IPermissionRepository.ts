import { IPermission } from "../entities/Permission";

export interface IPermissionRepository {
  create(permission: IPermission): Promise<IPermission>;
  findById(id: number): Promise<IPermission | null>;
  findBySlug(slug: string): Promise<IPermission | null>;
  findAll(params?: {
    skip?: number;
    limit?: number;
    module?: string;
    action?: string;
    status?: boolean;
  }): Promise<IPermission[]>;
  update(id: number, permission: Partial<IPermission>): Promise<IPermission | null>;
  delete(id: number): Promise<boolean>;
  count(params?: { module?: string; action?: string; status?: boolean }): Promise<number>;
}


