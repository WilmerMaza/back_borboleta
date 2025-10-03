import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AdminUserLoginHandler } from '../../application/command-handlers/admin/AdminUserLoginHandler';
import { AdminUserLoginCommand } from '../../application/commands/admin/AdminUserLoginCommand';
import { Logger } from '../../shared/utils/logger';

export class AdminUserAuthController {
  // POST /api/admin/login - Login para AdminUser
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      Logger.log('Solicitud de login de AdminUser recibida:', { email });

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      const loginHandler = container.resolve(AdminUserLoginHandler);
      const loginCommand = new AdminUserLoginCommand(email, password);
      
      const result = await loginHandler.handle(loginCommand);

      Logger.log('✅ Login de AdminUser exitoso:', { 
        email, 
        userId: result.user.id,
        userName: result.user.name 
      });

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error: any) {
      Logger.error('Error en login de AdminUser:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Error en el login'
      });
    }
  };

  // GET /api/admin/me - Obtener información del AdminUser autenticado
  getMe = async (req: any, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de información de AdminUser recibida');

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const AdminUserModel = require('../../infrastructure/database/models/AdminUserModel').default;
      const RoleModel = require('../../infrastructure/database/models/RoleModel').default;
      const RolePermissionModel = require('../../infrastructure/database/models/RolePermissionModel').default;
      const PermissionModel = require('../../infrastructure/database/models/PermissionModel').default;

      // Buscar el AdminUser
      const adminUser = await AdminUserModel.findOne({ id: req.user.userId });
      
      if (!adminUser) {
        res.status(404).json({
          success: false,
          message: 'AdminUser no encontrado'
        });
        return;
      }

      const adminUserObj = (adminUser as any).toObject();

      // Obtener información del rol
      let roleInfo = null;
      if (adminUserObj.role_id) {
        roleInfo = await RoleModel.findOne({ id: adminUserObj.role_id });
      }

      // Obtener permisos del rol
      let permissions = [];
      if (adminUserObj.role_id) {
        const rolePermissions = await RolePermissionModel.find({ 
          role_id: adminUserObj.role_id 
        });
        
        if (rolePermissions.length > 0) {
          const permissionIds = rolePermissions.map((rp: any) => rp.permission_id);
          permissions = await PermissionModel.find({ 
            id: { $in: permissionIds } 
          });
        }
      }

      Logger.log('✅ Información de AdminUser obtenida:', {
        email: adminUserObj.email,
        name: adminUserObj.name,
        roleId: adminUserObj.role_id,
        permissionsCount: permissions.length
      });

      res.status(200).json({
        success: true,
        data: {
          id: adminUserObj.id,
          name: adminUserObj.name,
          email: adminUserObj.email,
          employee_id: adminUserObj.employee_id,
          department: adminUserObj.department,
          position: adminUserObj.position,
          access_level: adminUserObj.access_level,
          is_active: adminUserObj.is_active,
          status: adminUserObj.status,
          profile_image: adminUserObj.profile_image,
          role_id: adminUserObj.role_id,
          role: roleInfo ? roleInfo.slug : 'consumer',
          role_name: roleInfo ? roleInfo.name : 'consumer',
          permissions: permissions.map((p: any) => ({
            id: p.id,
            name: p.name,
            module: p.module,
            action: p.action,
            resource: p.resource
          })),
          created_at: (adminUser as any).createdAt?.toISOString(),
          updated_at: (adminUser as any).updatedAt?.toISOString(),
          last_login: adminUserObj.last_login
        }
      });
    } catch (error: any) {
      Logger.error('Error al obtener información de AdminUser:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };
}
