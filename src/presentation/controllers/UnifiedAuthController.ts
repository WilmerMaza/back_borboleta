import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { UnifiedLoginHandler } from '../../application/command-handlers/user/UnifiedLoginHandler';
import { UnifiedLoginCommand } from '../../application/commands/user/UnifiedLoginCommand';
import { Logger } from '../../shared/utils/logger';

export class UnifiedAuthController {
  // POST /api/users/login - Login para frontend (clientes)
  loginFrontend = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      Logger.log('Solicitud de login frontend recibida:', { email });

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      const loginHandler = container.resolve(UnifiedLoginHandler);
      const loginCommand = new UnifiedLoginCommand(email, password, 'frontend');
      
      const result = await loginHandler.handle(loginCommand);

      Logger.log('✅ Login frontend exitoso:', { 
        email, 
        userId: result.user.id,
        userName: result.user.name,
        role: result.user.role_name
      });

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error: any) {
      Logger.error('Error en login frontend:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Error en el login'
      });
    }
  };

  // POST /api/admin/login - Login para backoffice (staff)
  loginBackoffice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      Logger.log('Solicitud de login backoffice recibida:', { email });

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
        return;
      }

      const loginHandler = container.resolve(UnifiedLoginHandler);
      const loginCommand = new UnifiedLoginCommand(email, password, 'backoffice');
      
      const result = await loginHandler.handle(loginCommand);

      Logger.log('✅ Login backoffice exitoso:', { 
        email, 
        userId: result.user.id,
        userName: result.user.name,
        role: result.user.role_name
      });

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error: any) {
      Logger.error('Error en login backoffice:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Error en el login'
      });
    }
  };

  // GET /api/users/me - Obtener información del usuario autenticado (frontend)
  getMeFrontend = async (req: any, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de información de usuario frontend recibida');

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const UserModel = require('../../infrastructure/database/models/UserModel').default;
      const RoleModel = require('../../infrastructure/database/models/RoleModel').default;

      // Buscar el usuario
      const user = await UserModel.findOne({ id: req.user.userId });
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const userObj = (user as any).toObject();

      // Obtener información del rol
      let roleInfo = null;
      if (userObj.role_id) {
        roleInfo = await RoleModel.findOne({ id: userObj.role_id });
      }

      Logger.log('✅ Información de usuario frontend obtenida:', {
        email: userObj.email,
        name: userObj.name,
        roleId: userObj.role_id
      });

      res.status(200).json({
        success: true,
        data: {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          phone: userObj.phone,
          country_code: userObj.country_code,
          status: userObj.status,
          email_verified_at: userObj.email_verified_at,
          is_approved: userObj.is_approved,
          role_id: userObj.role_id,
          role_name: roleInfo ? roleInfo.name : 'consumer',
          role_slug: roleInfo ? roleInfo.slug : 'consumer',
          created_at: (user as any).createdAt?.toISOString(),
          updated_at: (user as any).updatedAt?.toISOString()
        }
      });
    } catch (error: any) {
      Logger.error('Error al obtener información de usuario frontend:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  // GET /api/admin/me - Obtener información del usuario autenticado (backoffice)
  getMeBackoffice = async (req: any, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const UserModel = require('../../infrastructure/database/models/UserModel').default;
      const RoleModel = require('../../infrastructure/database/models/RoleModel').default;
      const PermissionModel = require('../../infrastructure/database/models/PermissionModel').default;

      // Buscar el usuario
      const user = await UserModel.findOne({ id: req.user.userId });
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      const userObj = (user as any).toObject();

      // Obtener información del rol
      let roleInfo = null;
      if (userObj.role_id) {
        roleInfo = await RoleModel.findOne({ id: userObj.role_id });
      }

      // Obtener permisos del rol desde el campo permissions del rol
      let permissions = [];
      if (roleInfo && roleInfo.permissions && roleInfo.permissions.length > 0) {
        permissions = await PermissionModel.find({ 
          id: { $in: roleInfo.permissions } 
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          phone: userObj.phone,
          country_code: userObj.country_code,
          status: userObj.status,
          email_verified_at: userObj.email_verified_at,
          is_approved: userObj.is_approved,
          role_id: userObj.role_id,
          role_name: roleInfo ? roleInfo.name : 'consumer',
          role_slug: roleInfo ? roleInfo.slug : 'consumer',
          permissions: permissions.map((p: any) => ({
            id: p.id,
            name: p.name,
            module: p.module,
            action: p.action,
            resource: p.resource
          })),
          created_at: (user as any).createdAt?.toISOString(),
          updated_at: (user as any).updatedAt?.toISOString()
        }
      });
    } catch (error: any) {
      Logger.error('Error al obtener información de usuario backoffice:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };
}
