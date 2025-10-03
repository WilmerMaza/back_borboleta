export interface IAdminUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  employee_id?: string;
  department?: 'IT' | 'Sales' | 'Marketing' | 'Support' | 'Management' | 'Finance' | 'HR';
  position?: string;
  role_id: number; // ID numérico del rol
  role_name?: 'super_admin' | 'admin' | 'manager' | 'staff' | 'viewer';
  role?: 'consumer' | 'admin' | 'vendor' | 'staff'; // Campo opcional para filtrar
  permissions?: string[];
  profile_image?: string;
  status: boolean;
  is_active: boolean;
  last_login?: string;
  login_attempts?: number;
  lock_until?: string;
  email_verified_at?: string;
  phone?: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  access_level?: 'full' | 'limited' | 'read_only';
  created_by?: string; // ObjectId del admin que lo creó
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserLoginRequest {
  email: string;
  password: string;
}

export interface AdminUserCreateRequest {
  name: string;
  email: string;
  password: string;
  employee_id?: string;
  department?: string;
  position?: string;
  role_id: number;
  role?: 'consumer' | 'admin' | 'vendor' | 'staff';
  phone?: string;
  access_level?: string;
  notes?: string;
}

export interface AdminUserUpdateRequest {
  name?: string;
  email?: string;
  employee_id?: string;
  department?: string;
  position?: string;
  role_id?: string;
  role?: 'consumer' | 'admin' | 'vendor' | 'staff';
  permissions?: string[];
  profile_image?: string;
  status?: boolean;
  is_active?: boolean;
  phone?: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  access_level?: string;
  notes?: string;
}

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  employee_id?: string;
  department?: string;
  position?: string;
  role_id: number;
  role_name?: string;
  role?: string;
  permissions?: string[];
  profile_image?: string;
  status: boolean;
  is_active: boolean;
  last_login?: string;
  email_verified_at?: string;
  phone?: string;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  access_level?: string;
  created_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}




