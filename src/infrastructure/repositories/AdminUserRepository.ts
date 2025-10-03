import { injectable } from 'tsyringe';
import { IAdminUserRepository } from '../../domain/repositories/IAdminUserRepository';
import { IAdminUser, AdminUserCreateRequest, AdminUserUpdateRequest } from '../../domain/entities/AdminUser';
import AdminUserModel from '../database/models/AdminUserModel';
import { Logger } from '../../shared/utils/logger';

@injectable()
export class AdminUserRepository implements IAdminUserRepository {
  async create(adminUser: AdminUserCreateRequest): Promise<IAdminUser> {
    try {
      console.log('🔍 [AdminUserRepository] Datos recibidos:', JSON.stringify(adminUser, null, 2));
      
      const newAdminUser = new AdminUserModel(adminUser);
      const savedAdminUser = await (newAdminUser as any).save();
      
      console.log('✅ [AdminUserRepository] Usuario creado exitosamente:', (savedAdminUser as any).id);
      
      const adminUserObj = (savedAdminUser as any).toObject();
      return {
        ...adminUserObj,
        id: adminUserObj.id,
        created_at: (savedAdminUser as any).createdAt?.toISOString(),
        updated_at: (savedAdminUser as any).updatedAt?.toISOString()
      };
    } catch (error: any) {
      console.error('❌ [AdminUserRepository] Error al crear usuario:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`El ${field} ya existe en el sistema`);
      }
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new Error(`Error de validación: ${messages.join(', ')}`);
      }
      
      throw new Error(`Error al crear usuario administrativo: ${error.message}`);
    }
  }

  async findById(id: number): Promise<IAdminUser | null> {
    try {
      console.log('🔍 [AdminUserRepository] Buscando usuario con ID:', id);
      
      // Validar que el ID sea un número válido
      if (isNaN(id) || id <= 0) {
        console.log('❌ [AdminUserRepository] ID inválido:', id);
        return null;
      }
      
      const adminUser = await AdminUserModel.findOne({ id, status: true });
      if (!adminUser) {
        console.log('❌ [AdminUserRepository] Usuario no encontrado con ID:', id);
        return null;
      }
      
      console.log('✅ [AdminUserRepository] Usuario encontrado:', (adminUser as any).name);
      
      const adminUserObj = (adminUser as any).toObject();
      return {
        ...adminUserObj,
        id: adminUserObj.id,
        created_at: (adminUser as any).createdAt?.toISOString(),
        updated_at: (adminUser as any).updatedAt?.toISOString()
      };
    } catch (error: any) {
      console.error('❌ [AdminUserRepository] Error al obtener usuario:', error);
      throw new Error(`Error al obtener usuario administrativo: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<IAdminUser | null> {
    try {
      const adminUser = await AdminUserModel.findOne({ 
        email: email.toLowerCase(), 
        status: true 
      });
      if (!adminUser) return null;
      
      const adminUserObj = (adminUser as any).toObject();
      return {
        ...adminUserObj,
        id: adminUserObj.id,
        created_at: (adminUser as any).createdAt?.toISOString(),
        updated_at: (adminUser as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al obtener usuario administrativo por email');
    }
  }

  async findByEmployeeId(employeeId: string): Promise<IAdminUser | null> {
    try {
      const adminUser = await AdminUserModel.findOne({ 
        employee_id: employeeId, 
        status: true 
      });
      if (!adminUser) return null;
      
      const adminUserObj = (adminUser as any).toObject();
      return {
        ...adminUserObj,
        id: adminUserObj.id,
        created_at: (adminUser as any).createdAt?.toISOString(),
        updated_at: (adminUser as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al obtener usuario administrativo por ID de empleado');
    }
  }

  async findAll(params: { 
    skip: number; 
    limit: number; 
    department?: string; 
    role?: string; 
    status?: boolean;
    search?: string;
    field?: string;
    sort?: string;
  }): Promise<IAdminUser[]> {
    try {
      const filter: any = { status: true };
      
      if (params.department) {
        filter.department = params.department;
      }
      
      if (params.role) {
        filter.role = params.role;
      }
      
      if (params.status !== undefined) {
        filter.status = params.status;
      }

      // Búsqueda por texto
      if (params.search && params.field) {
        const searchRegex = new RegExp(params.search, 'i');
        filter[params.field] = searchRegex;
      } else if (params.search) {
        // Búsqueda general en nombre y email
        const searchRegex = new RegExp(params.search, 'i');
        filter.$or = [
          { name: searchRegex },
          { email: searchRegex }
        ];
      }

      // Configurar ordenamiento
      let sortOption: any = { created_at: -1 };
      if (params.sort) {
        const sortField = params.sort;
        const sortDirection = sortField.startsWith('-') ? -1 : 1;
        const field = sortField.replace('-', '');
        sortOption = { [field]: sortDirection };
      }

      const adminUsers = await AdminUserModel.find(filter)
        .skip(params.skip)
        .limit(params.limit)
        .sort(sortOption);
      
      // Mapear roles para cada usuario
      const mappedAdminUsers = await Promise.all(adminUsers.map(async (adminUser) => {
        const adminUserObj = (adminUser as any).toObject();
        
        // Buscar el rol correspondiente
        let roleName = 'consumer'; // Default
        let roleSlug = 'consumer'; // Default
        
        if (adminUserObj.role_id) {
          try {
            const RoleModel = require('../database/models/RoleModel').default;
            const role = await RoleModel.findOne({ id: adminUserObj.role_id });
            if (role) {
              roleName = (role as any).name;
              roleSlug = (role as any).slug;
            }
          } catch (error) {
            Logger.error(`Error al buscar rol con ID ${adminUserObj.role_id}:`, error);
          }
        }
        
        return {
          ...adminUserObj,
          id: adminUserObj.id,
          role_name: roleName,
          role: roleSlug,
          created_at: (adminUser as any).createdAt?.toISOString(),
          updated_at: (adminUser as any).updatedAt?.toISOString()
        };
      }));
      
      return mappedAdminUsers;
    } catch (error) {
      throw new Error('Error al obtener usuarios administrativos');
    }
  }

  async update(id: number, adminUser: AdminUserUpdateRequest): Promise<IAdminUser | null> {
    try {
      const updatedAdminUser = await AdminUserModel.findOneAndUpdate(
        { id, status: true },
        adminUser,
        { new: true }
      );
      
      if (!updatedAdminUser) return null;
      
      const adminUserObj = (updatedAdminUser as any).toObject();
      return {
        ...adminUserObj,
        id: adminUserObj.id,
        created_at: (updatedAdminUser as any).createdAt?.toISOString(),
        updated_at: (updatedAdminUser as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al actualizar usuario administrativo');
    }
  }

  async updatePassword(id: number, newPassword: string): Promise<IAdminUser | null> {
    try {
      const updatedAdminUser = await AdminUserModel.findOneAndUpdate(
        { id, status: true },
        { password: newPassword },
        { new: true }
      );
      
      if (!updatedAdminUser) return null;
      
      const adminUserObj = (updatedAdminUser as any).toObject();
      return {
        ...adminUserObj,
        id: adminUserObj.id,
        created_at: (updatedAdminUser as any).createdAt?.toISOString(),
        updated_at: (updatedAdminUser as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al actualizar contraseña');
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await AdminUserModel.findOneAndDelete({ id });
      return !!result;
    } catch (error) {
      Logger.error(`Error al eliminar usuario administrativo con ID ${id}:`, error);
      throw new Error('Error al eliminar usuario administrativo');
    }
  }

  async count(params?: { role?: string }): Promise<number> {
    try {
      const filter: any = { status: true };
      
      if (params?.role) {
        filter.role = params.role;
      }
      
      const total = await AdminUserModel.countDocuments(filter);
      return total;
    } catch (error) {
      throw new Error('Error al contar usuarios administrativos');
    }
  }

  async findByRole(roleId: number): Promise<IAdminUser[]> {
    try {
      const adminUsers = await AdminUserModel.find({ 
        role_id: roleId, 
        status: true 
      });
      
      return adminUsers.map(adminUser => {
        const adminUserObj = (adminUser as any).toObject();
        return {
          ...adminUserObj,
          id: adminUserObj.id,
          created_at: (adminUser as any).createdAt?.toISOString(),
          updated_at: (adminUser as any).updatedAt?.toISOString()
        };
      });
    } catch (error) {
      throw new Error('Error al obtener usuarios por rol');
    }
  }

  async findByDepartment(department: string): Promise<IAdminUser[]> {
    try {
      const adminUsers = await AdminUserModel.find({ 
        department, 
        status: true 
      });
      
      return adminUsers.map(adminUser => {
        const adminUserObj = (adminUser as any).toObject();
        return {
          ...adminUserObj,
          id: adminUserObj.id,
          created_at: (adminUser as any).createdAt?.toISOString(),
          updated_at: (adminUser as any).updatedAt?.toISOString()
        };
      });
    } catch (error) {
      throw new Error('Error al obtener usuarios por departamento');
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    try {
      await AdminUserModel.findOneAndUpdate(
        { id },
        { 
          last_login: new Date(),
          $unset: { login_attempts: 1, lock_until: 1 }
        }
      );
    } catch (error) {
      throw new Error('Error al actualizar último login');
    }
  }

  async incrementLoginAttempts(id: number): Promise<void> {
    try {
      const adminUser = await AdminUserModel.findOne({ id });
      if (adminUser) {
        await (adminUser as any).incLoginAttempts();
      }
    } catch (error) {
      throw new Error('Error al incrementar intentos de login');
    }
  }

  async resetLoginAttempts(id: number): Promise<void> {
    try {
      const adminUser = await AdminUserModel.findOne({ id });
      if (adminUser) {
        await (adminUser as any).resetLoginAttempts();
      }
    } catch (error) {
      throw new Error('Error al resetear intentos de login');
    }
  }

  async lockAccount(id: number, lockUntil: Date): Promise<void> {
    try {
      await AdminUserModel.findOneAndUpdate(
        { id },
        { lock_until: lockUntil }
      );
    } catch (error) {
      throw new Error('Error al bloquear cuenta');
    }
  }

  async unlockAccount(id: number): Promise<void> {
    try {
      await AdminUserModel.findOneAndUpdate(
        { id },
        { 
          $unset: { lock_until: 1, login_attempts: 1 }
        }
      );
    } catch (error) {
      throw new Error('Error al desbloquear cuenta');
    }
  }
}

