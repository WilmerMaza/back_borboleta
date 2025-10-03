export interface IPermission {
  id?: number;
  name: string; // "user.create", "user.edit", etc.
  slug: string;
  guard_name: string; // "web"
  description?: string;
  module: string; // 'users', 'products', 'orders', 'reports', etc.
  action: string; // 'create', 'read', 'update', 'delete', 'manage'
  resource?: string; // 'all', 'own', 'department'
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionCreateRequest {
  name: string;
  slug: string;
  guard_name: string;
  description?: string;
  module: string;
  action: string;
  resource?: string;
  status?: boolean;
}

export interface PermissionUpdateRequest {
  name?: string;
  slug?: string;
  guard_name?: string;
  description?: string;
  module?: string;
  action?: string;
  resource?: string;
  status?: boolean;
}

export interface PermissionResponse {
  id: number;
  name: string;
  slug: string;
  guard_name: string;
  description?: string;
  module: string;
  action: string;
  resource?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}
