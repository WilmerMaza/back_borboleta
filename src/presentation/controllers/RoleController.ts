import { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { RoleCreateRequest, RoleUpdateRequest, AssignPermissionsRequest } from '../../domain/entities/Role';
import { AuthenticatedRequest } from '../../middleware/auth';

@injectable()
export class RoleController {
  constructor(
    @inject('RoleRepository') private roleRepository: IRoleRepository,
    @inject('PermissionRepository') private permissionRepository: IPermissionRepository
  ) {}

  // GET /api/roles - Obtener todos los roles
  async getRoles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status === 'true' ? true : req.query.status === 'false' ? false : undefined;

      const skip = (page - 1) * limit;

      const roles = await this.roleRepository.findAll({
        skip,
        limit,
        status
      });

      // Obtener permisos para cada rol
      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          const permissions = await this.permissionRepository.findAll({
            limit: 1000 // Obtener todos los permisos
          });
          
          const rolePermissions = permissions.filter(permission => 
            role.permissions?.includes(permission.id!)
          );

          return {
            ...role,
            permissions: rolePermissions
          };
        })
      );

      const total = await this.roleRepository.count({ status });

      res.status(200).json({
        success: true,
        data: {
          roles: rolesWithPermissions,
          pagination: {
            current_page: page,
            per_page: limit,
            total,
            last_page: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/roles/:id - Obtener rol por ID
  async getRoleById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const roleId = parseInt(id);

      if (isNaN(roleId) || roleId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de rol inválido'
        });
        return;
      }

      const role = await this.roleRepository.findById(roleId);

      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      // Obtener permisos del rol
      const permissions = await this.permissionRepository.findAll({
        limit: 1000
      });
      
      const rolePermissions = permissions.filter(permission => 
        role.permissions?.includes(permission.id!)
      );

      res.status(200).json({
        success: true,
        data: {
          role: {
            ...role,
            permissions: rolePermissions
          }
        }
      });
    } catch (error: any) {
      console.error('Error al obtener rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // POST /api/roles - Crear rol
  async createRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const roleData: RoleCreateRequest = req.body;

      // Validaciones básicas
      if (!roleData.name || !roleData.slug) {
        res.status(400).json({
          success: false,
          message: 'Nombre y slug son requeridos'
        });
        return;
      }

      // Verificar si el slug ya existe
      const existingRole = await this.roleRepository.findBySlug(roleData.slug);
      if (existingRole) {
        res.status(400).json({
          success: false,
          message: 'El slug ya está en uso'
        });
        return;
      }

      const role = await this.roleRepository.create({
        ...roleData,
        status: roleData.status ?? true
      });

      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: {
          role
        }
      });
    } catch (error: any) {
      console.error('Error al crear rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // PUT /api/roles/:id - Actualizar rol
  async updateRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const roleId = parseInt(id);

      if (isNaN(roleId) || roleId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de rol inválido'
        });
        return;
      }

      const updateData: RoleUpdateRequest = req.body;

      // Verificar que el rol existe
      const existingRole = await this.roleRepository.findById(roleId);
      if (!existingRole) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      // Verificar si el slug ya existe en otro rol
      if (updateData.slug && updateData.slug !== existingRole.slug) {
        const roleWithSlug = await this.roleRepository.findBySlug(updateData.slug);
        if (roleWithSlug && roleWithSlug.id !== roleId) {
          res.status(400).json({
            success: false,
            message: 'El slug ya está en uso por otro rol'
          });
          return;
        }
      }

      const updatedRole = await this.roleRepository.update(roleId, updateData);

      res.status(200).json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: {
          role: updatedRole
        }
      });
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // DELETE /api/roles/:id - Eliminar rol
  async deleteRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const roleId = parseInt(id);

      if (isNaN(roleId) || roleId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de rol inválido'
        });
        return;
      }

      const deleted = await this.roleRepository.delete(roleId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Rol eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // POST /api/roles/:id/permissions - Asignar permisos a un rol
  async assignPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const roleId = parseInt(id);
      const { permission_ids }: AssignPermissionsRequest = req.body;

      if (isNaN(roleId) || roleId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de rol inválido'
        });
        return;
      }

      if (!permission_ids || !Array.isArray(permission_ids) || permission_ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Se requieren IDs de permisos válidos'
        });
        return;
      }

      // Verificar que el rol existe
      const existingRole = await this.roleRepository.findById(roleId);
      if (!existingRole) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      // Verificar que todos los permisos existen
      const permissions = await this.permissionRepository.findAll({ limit: 1000 });
      const validPermissionIds = permissions.map(p => p.id!);
      const invalidIds = permission_ids.filter(id => !validPermissionIds.includes(id));
      
      if (invalidIds.length > 0) {
        res.status(400).json({
          success: false,
          message: `Los siguientes IDs de permisos no existen: ${invalidIds.join(', ')}`
        });
        return;
      }

      const updatedRole = await this.roleRepository.assignPermissions(roleId, permission_ids);

      res.status(200).json({
        success: true,
        message: 'Permisos asignados exitosamente',
        data: {
          role: updatedRole
        }
      });
    } catch (error: any) {
      console.error('Error al asignar permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // DELETE /api/roles/:id/permissions - Remover permisos de un rol
  async removePermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const roleId = parseInt(id);
      const { permission_ids }: AssignPermissionsRequest = req.body;

      if (isNaN(roleId) || roleId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de rol inválido'
        });
        return;
      }

      if (!permission_ids || !Array.isArray(permission_ids) || permission_ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Se requieren IDs de permisos válidos'
        });
        return;
      }

      // Verificar que el rol existe
      const existingRole = await this.roleRepository.findById(roleId);
      if (!existingRole) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      const updatedRole = await this.roleRepository.removePermissions(roleId, permission_ids);

      res.status(200).json({
        success: true,
        message: 'Permisos removidos exitosamente',
        data: {
          role: updatedRole
        }
      });
    } catch (error: any) {
      console.error('Error al remover permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}