export interface IRole {
  id?: number;
  name: string;
  slug: string;
  guard_name?: string;
  system_reserve?: number;
  description?: string;
  permissions?: number[]; // Array de IDs de permisos
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoleCreateRequest {
  name: string;
  slug?: string; // Ahora es opcional
  guard_name?: string;
  system_reserve?: number;
  description?: string;
  permission_ids?: number[];
  status?: boolean;
}

export interface RoleUpdateRequest {
  name?: string;
  slug?: string;
  description?: string;
  permission_ids?: number[];
  status?: boolean;
}

export interface RoleResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  permissions: PermissionResponse[];
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignPermissionsRequest {
  permission_ids: number[];
}

// Importar PermissionResponse para el tipo
import { PermissionResponse } from './Permission';
