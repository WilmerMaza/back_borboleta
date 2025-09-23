import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthService } from '../../application/services/AuthService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Logger } from '../../shared/utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth';
import UserModel from '../../infrastructure/database/models/UserModel';

@injectable()
export class AuthController {
  constructor(
    @inject('AuthService') private authService: AuthService,
    @inject('UserRepository') private userRepository: IUserRepository
  ) {}

  // POST /api/auth/register - Registro de usuarios para back office
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, password_confirmation, phone, country_code } = req.body;

      Logger.log('Solicitud de registro recibida:', { name, email, phone });

      // Validaciones
      if (!name || !email || !password || !password_confirmation) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
        return;
      }

      if (password !== password_confirmation) {
        res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'El email ya está registrado',
          errors: {
            email: ['El email ya está en uso']
          }
        });
        return;
      }

      // Hash de la contraseña
      const hashedPassword = await this.authService.hashPassword(password);

      // Crear usuario
      const userData = {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        country_code: parseInt(country_code) || 1,
        role_id: 1, // Rol por defecto (admin)
        status: true,
        is_approved: true
      };

      const newUser = await this.userRepository.create(userData);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
          }
        }
      });
    } catch (error: any) {
      Logger.error('Error al registrar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/auth/me - Obtener información del usuario autenticado
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.log('🔍 [AUTH/ME] Iniciando endpoint /api/auth/me');
      
      if (!req.user) {
        Logger.log('❌ [AUTH/ME] Usuario no autenticado en request');
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      Logger.log('👤 [AUTH/ME] Usuario autenticado:', {
        userId: req.user.userId,
        email: req.user.email
      });

      // Importar modelos necesarios
      const RoleModel = require('../../infrastructure/database/models/RoleModel').default;
      const PermissionModel = require('../../infrastructure/database/models/PermissionModel').default;
      const RolePermissionModel = require('../../infrastructure/database/models/RolePermissionModel').default;

      // Buscar usuario completo en la base de datos
      Logger.log('🔍 [AUTH/ME] Buscando usuario en BD con ID:', req.user.userId);
      const user = await UserModel.findOne({ id: req.user.userId });
      
      if (!user) {
        Logger.log('❌ [AUTH/ME] Usuario no encontrado en BD');
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      Logger.log('✅ [AUTH/ME] Usuario encontrado:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      });

      // Buscar el rol del usuario
      Logger.log('🛡️ [AUTH/ME] Buscando rol con ID:', user.role_id);
      const role = await RoleModel.findOne({ id: user.role_id });
      
      if (role) {
        Logger.log('✅ [AUTH/ME] Rol encontrado:', {
          id: role.id,
          name: role.name,
          guard_name: role.guard_name
        });
      } else {
        Logger.log('❌ [AUTH/ME] Rol no encontrado');
      }
      
      // Buscar permisos del rol
      let permissions: any[] = [];
      if (role) {
        Logger.log('🔑 [AUTH/ME] Buscando permisos del rol...');
        const rolePermissions = await RolePermissionModel.find({ role_id: role.id });
        Logger.log('📊 [AUTH/ME] Relaciones rol-permiso encontradas:', rolePermissions.length);
        
        const permissionIds = rolePermissions.map((rp: any) => rp.permission_id);
        
        if (permissionIds.length > 0) {
          Logger.log('🔍 [AUTH/ME] Buscando detalles de permisos...');
          const permissionDocs = await PermissionModel.find({ id: { $in: permissionIds } });
          Logger.log('📋 [AUTH/ME] Permisos encontrados:', permissionDocs.length);
          
          permissions = permissionDocs.map((permission: any) => ({
            id: permission.id,
            name: permission.name,
            guard_name: permission.guard_name || 'web',
            created_at: permission.createdAt?.toISOString() || new Date().toISOString(),
            updated_at: permission.updatedAt?.toISOString() || new Date().toISOString(),
            pivot: {
              role_id: role.id.toString(),
              permission_id: permission.id.toString()
            }
          }));
        }
      }

      // Preparar respuesta con estructura completa
      Logger.log('📝 [AUTH/ME] Preparando respuesta...');
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        country_code: user.country_code?.toString() || '1',
        phone: user.phone || '',
        status: user.status ? 1 : 0,
        created_at: user.created_at || new Date().toISOString(),
        role: role ? {
          id: role.id,
          name: role.name,
          guard_name: role.guard_name || 'web',
          system_reserve: role.system_reserve?.toString() || '0'
        } : null,
        permission: permissions // Nota: singular "permission" como especifica el frontend
      };

      Logger.log('🎉 [AUTH/ME] Respuesta preparada:', {
        userId: userResponse.id,
        userName: userResponse.name,
        userEmail: userResponse.email,
        roleId: userResponse.role?.id,
        roleName: userResponse.role?.name,
        permissionsCount: userResponse.permission.length
      });

      res.status(200).json({
        success: true,
        data: userResponse
      });
    } catch (error: any) {
      Logger.error('❌ [AUTH/ME] Error al obtener información del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/auth/logout - Cerrar sesión
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.log('Solicitud de logout recibida:', req.user?.userId);

      // En un sistema real, aquí podrías:
      // 1. Agregar el token a una lista negra (blacklist)
      // 2. Eliminar el token del cliente
      // 3. Registrar el logout en logs de auditoría

      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error: any) {
      Logger.error('Error al cerrar sesión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}