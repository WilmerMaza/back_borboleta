import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { Logger } from '../../shared/utils/logger';
import UserModel from '../../infrastructure/database/models/UserModel';
import RoleModel from '../../infrastructure/database/models/RoleModel';
import PermissionModel from '../../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../../infrastructure/database/models/RolePermissionModel';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AuthService } from '../../application/services/AuthService';

@injectable()
export class AdminController {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  // POST /api/admin/users - Crear usuario desde backoffice con rol dinámico
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, country_code, role_id, status, is_approved } = req.body;

      Logger.log('Solicitud de creación de usuario desde backoffice:', { name, email, role_id });

      // Validaciones
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Nombre, email y contraseña son requeridos'
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
          message: 'El email ya está registrado'
        });
        return;
      }

      // Verificar que el rol existe si se especifica
      if (role_id) {
        const role = await RoleModel.findOne({ id: role_id });
        if (!role) {
          res.status(400).json({
            success: false,
            message: 'El rol especificado no existe'
          });
          return;
        }
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
        role_id: role_id || 4, // Default a consumer (ID: 4)
        status: status !== undefined ? status : true,
        email_verified_at: new Date().toISOString(),
        is_approved: is_approved !== undefined ? is_approved : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newUser = await this.userRepository.create(userData);

      // Obtener información del rol con permisos
      const role = await RoleModel.findOne({ id: newUser.role_id });

      const userObj = (newUser as any).toObject ? (newUser as any).toObject() : newUser;

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          country_code: newUser.country_code,
          role_id: newUser.role_id,
          role_name: role?.name,
          role_slug: role?.slug,
          permissions: role?.permissions || [], // Incluir permisos del rol
          status: newUser.status,
          is_approved: newUser.is_approved,
          created_at: (userObj as any).createdAt || userObj.created_at,
          updated_at: (userObj as any).updatedAt || userObj.updated_at
        }
      });

    } catch (error: any) {
      Logger.error('Error al crear usuario desde backoffice:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/admin/users - Listar usuarios para backoffice
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search, role_id, status } = req.query;

      Logger.log('Solicitud de listado de usuarios desde backoffice:', { page, limit, search, role_id, status });

      // Construir filtros
      const filters: any = {};
      
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (role_id) {
        filters.role_id = parseInt(role_id as string);
      }

      if (status !== undefined) {
        filters.status = status === 'true' || status === '1';
      }

      // Paginación
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const users = await UserModel.find(filters)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit as string))
        .sort({ created_at: -1 });

      const total = await UserModel.countDocuments(filters);

      // Obtener información de roles con permisos para cada usuario
      const usersWithRoles = await Promise.all(
        users.map(async (user: any) => {
          const role = await RoleModel.findOne({ id: user.role_id });
          const userObj = user.toObject();
          
          // Normalizar nombres de campos de fecha
          return {
            ...userObj,
            created_at: userObj.createdAt || userObj.created_at,
            updated_at: userObj.updatedAt || userObj.updated_at,
            role_name: role?.name,
            role_slug: role?.slug,
            permissions: role?.permissions || [] // Incluir permisos del rol
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: usersWithRoles, // Directamente el array de usuarios
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });

    } catch (error: any) {
      Logger.error('Error al obtener usuarios desde backoffice:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/admin/users/:id - Actualizar usuario desde backoffice
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, country_code, role_id, status, is_approved } = req.body;

      Logger.log('Solicitud de actualización de usuario desde backoffice:', { id, ...req.body });

      // Buscar usuario
      const user = await UserModel.findOne({ id: parseInt(id) });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Verificar email único si se está cambiando
      if (email && email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: 'El email ya está en uso por otro usuario'
          });
          return;
        }
      }

      // Verificar rol si se especifica
      if (role_id) {
        const role = await RoleModel.findOne({ id: role_id });
        if (!role) {
          res.status(400).json({
            success: false,
            message: 'El rol especificado no existe'
          });
          return;
        }
      }

      // Actualizar usuario
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (country_code) updateData.country_code = parseInt(country_code);
      if (role_id) updateData.role_id = role_id;
      if (status !== undefined) updateData.status = status;
      if (is_approved !== undefined) updateData.is_approved = is_approved;

      await UserModel.updateOne({ id: parseInt(id) }, updateData);

      // Obtener usuario actualizado con permisos del rol
      const updatedUser = await UserModel.findOne({ id: parseInt(id) }).select('-password');
      const role = await RoleModel.findOne({ id: updatedUser?.role_id });
      const userObj = updatedUser?.toObject();

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: {
          ...userObj,
          created_at: (userObj as any)?.createdAt || userObj?.created_at,
          updated_at: (userObj as any)?.updatedAt || userObj?.updated_at,
          role_name: role?.name,
          role_slug: role?.slug,
          permissions: role?.permissions || [] // Incluir permisos del rol
        }
      });

    } catch (error: any) {
      Logger.error('Error al actualizar usuario desde backoffice:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /api/admin/users/:id - Eliminar usuario desde backoffice
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      Logger.log('Solicitud de eliminación de usuario desde backoffice:', { id });

      // Buscar usuario
      const user = await UserModel.findOne({ id: parseInt(id) });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Soft delete - marcar como eliminado
      await UserModel.updateOne(
        { id: parseInt(id) },
        { 
          status: false,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error: any) {
      Logger.error('Error al eliminar usuario desde backoffice:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  // Endpoint temporal para asignar permisos de administrador
  async assignAdminPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      Logger.log('Asignando permisos de administrador al usuario:', userId);

      // Buscar el usuario
      const user = await UserModel.findOne({ id: parseInt(userId) });
      if (!user) {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }

      // Crear o obtener el rol de admin
      let adminRole = await RoleModel.findOne({ name: 'admin' });
      
      if (!adminRole) {
        Logger.log('Creando rol de administrador...');
        
        // Crear permisos básicos si no existen
        const permissions = [
          { name: 'user.index', guard_name: 'web', resource: 'users', action: 'read' },
          { name: 'user.create', guard_name: 'web', resource: 'users', action: 'create' },
          { name: 'user.edit', guard_name: 'web', resource: 'users', action: 'update' },
          { name: 'user.destroy', guard_name: 'web', resource: 'users', action: 'delete' },
          { name: 'role.index', guard_name: 'web', resource: 'roles', action: 'read' },
          { name: 'role.create', guard_name: 'web', resource: 'roles', action: 'create' },
          { name: 'role.edit', guard_name: 'web', resource: 'roles', action: 'update' },
          { name: 'role.destroy', guard_name: 'web', resource: 'roles', action: 'delete' },
          { name: 'product.index', guard_name: 'web', resource: 'products', action: 'read' },
          { name: 'product.create', guard_name: 'web', resource: 'products', action: 'create' },
          { name: 'product.edit', guard_name: 'web', resource: 'products', action: 'update' },
          { name: 'product.destroy', guard_name: 'web', resource: 'products', action: 'delete' },
          { name: 'category.index', guard_name: 'web', resource: 'categories', action: 'read' },
          { name: 'category.create', guard_name: 'web', resource: 'categories', action: 'create' },
          { name: 'category.edit', guard_name: 'web', resource: 'categories', action: 'update' },
          { name: 'category.destroy', guard_name: 'web', resource: 'categories', action: 'delete' },
          { name: 'order.index', guard_name: 'web', resource: 'orders', action: 'read' },
          { name: 'order.create', guard_name: 'web', resource: 'orders', action: 'create' },
          { name: 'order.edit', guard_name: 'web', resource: 'orders', action: 'update' },
          { name: 'setting.index', guard_name: 'web', resource: 'settings', action: 'read' },
          { name: 'setting.edit', guard_name: 'web', resource: 'settings', action: 'update' },
          { name: 'cart.index', guard_name: 'web', resource: 'cart', action: 'read' },
          { name: 'cart.create', guard_name: 'web', resource: 'cart', action: 'create' },
          { name: 'cart.edit', guard_name: 'web', resource: 'cart', action: 'update' },
          { name: 'cart.destroy', guard_name: 'web', resource: 'cart', action: 'delete' },
          { name: 'checkout.index', guard_name: 'web', resource: 'checkout', action: 'read' },
          { name: 'checkout.create', guard_name: 'web', resource: 'checkout', action: 'create' },
          { name: 'address.index', guard_name: 'web', resource: 'address', action: 'read' },
          { name: 'address.create', guard_name: 'web', resource: 'address', action: 'create' },
          { name: 'address.edit', guard_name: 'web', resource: 'address', action: 'update' },
          { name: 'address.destroy', guard_name: 'web', resource: 'address', action: 'delete' }
        ];

        const createdPermissions = [];
        for (const permissionData of permissions) {
          const existingPermission = await PermissionModel.findOne({ name: permissionData.name });
          if (!existingPermission) {
            const permission = new PermissionModel(permissionData);
            await (permission as any).save();
            createdPermissions.push(permission);
            Logger.log(`   ✅ Permiso creado: ${(permission as any).name}`);
          } else {
            createdPermissions.push(existingPermission);
          }
        }

        // Crear rol de admin
        adminRole = new RoleModel({
          name: 'admin',
          guard_name: 'web',
          system_reserve: 1, // Rol del sistema
          description: 'Super administrador con todos los permisos',
          permissions: createdPermissions.map((p: any) => p._id)
        });
        await (adminRole as any).save();

        // Crear relaciones en la tabla pivot
        const rolePermissions = createdPermissions.map((permission: any) => ({
          role_id: (adminRole as any).id,
          permission_id: permission.id
        }));

        await RolePermissionModel.insertMany(rolePermissions);
        Logger.log(`   ✅ Rol de administrador creado con ${rolePermissions.length} permisos`);
      } else {
        Logger.log('✅ Rol de administrador ya existe');
      }

      // Asignar rol de admin al usuario
      (user as any).role_id = (adminRole as any).id;
      await (user as any).save();

      res.status(200).json({
        success: true,
        message: 'Permisos de administrador asignados exitosamente',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role_id: (adminRole as any).id
          }
        }
      });

    } catch (error: any) {
      Logger.error('Error al asignar permisos de administrador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
