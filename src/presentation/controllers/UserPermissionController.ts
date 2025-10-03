import { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { AuthenticatedRequest } from '../../middleware/auth';

@injectable()
export class UserPermissionController {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('RoleRepository') private roleRepository: IRoleRepository,
    @inject('PermissionRepository') private permissionRepository: IPermissionRepository
  ) {}

  // GET /api/users/:id/permissions - Obtener permisos de un usuario
  async getUserPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId) || userId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      // Buscar el usuario
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Buscar el rol del usuario
      const role = await this.roleRepository.findById(user.role_id);
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      // Obtener los permisos del rol
      const permissions = await this.permissionRepository.findAll({ limit: 1000 });
      const rolePermissions = permissions.filter(permission => 
        role.permissions?.includes(permission.id!)
      );

      res.status(200).json({
        success: true,
        user_name: user.name,
        data: rolePermissions.map(permission => ({
          id: permission.id,
          name: permission.name,
          permission_id: permission.id
        }))
      });
    } catch (error: any) {
      console.error('Error al obtener permisos del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // PUT /api/users/:id/permissions - Asignar permisos a un usuario
  async assignUserPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { permission_ids } = req.body;

      if (isNaN(userId) || userId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
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

      // Buscar el usuario
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Buscar el rol del usuario
      const role = await this.roleRepository.findById(user.role_id);
      if (!role) {
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

      // Actualizar los permisos del rol
      const updatedRole = await this.roleRepository.assignPermissions(role.id!, permission_ids);

      res.status(200).json({
        success: true,
        message: 'Permisos asignados exitosamente',
        data: {
          role: updatedRole
        }
      });
    } catch (error: any) {
      console.error('Error al asignar permisos al usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}


