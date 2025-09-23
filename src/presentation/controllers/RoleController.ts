import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { Logger } from '../../shared/utils/logger';
import RoleModel from '../../infrastructure/database/models/RoleModel';
import PermissionModel from '../../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../../infrastructure/database/models/RolePermissionModel';

@injectable()
export class RoleController {
  
  // GET /api/roles - Obtener todos los roles con sus permisos
  async getAllRoles(_req: Request, res: Response): Promise<void> {
    try {
      Logger.log('Obteniendo todos los roles...');

      const roles = await RoleModel.find()
        .populate({
          path: 'permissions',
          model: 'Permission',
          select: 'id name guard_name created_at updated_at'
        })
        .sort({ id: 1 });

      // Formatear respuesta con estructura pivot
      const formattedRoles = roles.map((role: any) => {
        const roleObj = role.toObject();
        return {
          id: roleObj.id,
          name: roleObj.name,
          guard_name: roleObj.guard_name || 'web',
          system_reserve: roleObj.system_reserve?.toString() || '0',
          created_at: roleObj.createdAt?.toISOString() || new Date().toISOString(),
          updated_at: roleObj.updatedAt?.toISOString() || new Date().toISOString(),
          permissions: (roleObj.permissions || []).map((permission: any) => ({
            id: permission.id,
            name: permission.name,
            guard_name: permission.guard_name || 'web',
            created_at: permission.createdAt?.toISOString() || new Date().toISOString(),
            updated_at: permission.updatedAt?.toISOString() || new Date().toISOString(),
            pivot: {
              role_id: roleObj.id.toString(),
              permission_id: permission.id.toString()
            }
          }))
        };
      });

      res.status(200).json({
        success: true,
        data: formattedRoles
      });
    } catch (error: any) {
      Logger.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/roles - Crear nuevo rol
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { name, permissions } = req.body;

      Logger.log('Creando nuevo rol:', { name, permissions });

      // Validaciones
      if (!name) {
        res.status(400).json({
          success: false,
          message: 'El nombre del rol es requerido'
        });
        return;
      }

      // Verificar si el rol ya existe
      const existingRole = await RoleModel.findOne({ name });
      if (existingRole) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un rol con ese nombre'
        });
        return;
      }

      // Crear el rol
      const newRole = new RoleModel({
        name,
        guard_name: 'web',
        system_reserve: 0,
        permissions: []
      });

      const savedRole = await (newRole as any).save();

      // Asignar permisos si se proporcionan
      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        // Verificar que los permisos existen
        const existingPermissions = await PermissionModel.find({ 
          id: { $in: permissions } 
        });

        if (existingPermissions.length !== permissions.length) {
          res.status(400).json({
            success: false,
            message: 'Algunos permisos no existen'
          });
          return;
        }

        // Crear relaciones en la tabla pivot
        const rolePermissions = permissions.map((permissionId: number) => ({
          role_id: savedRole.id,
          permission_id: permissionId
        }));

        await RolePermissionModel.insertMany(rolePermissions);

        // Actualizar el rol con los permisos
        (savedRole as any).permissions = existingPermissions.map((p: any) => p._id);
        await (savedRole as any).save();
      }

      // Obtener el rol completo con permisos para la respuesta
      const roleWithPermissions = await RoleModel.findById((savedRole as any)._id)
        .populate({
          path: 'permissions',
          model: 'Permission',
          select: 'id name guard_name created_at updated_at'
        });

      const roleObj = (roleWithPermissions as any)?.toObject();
      const formattedRole = {
        id: roleObj?.id,
        name: roleObj?.name,
        guard_name: roleObj?.guard_name || 'web',
        system_reserve: roleObj?.system_reserve?.toString() || '0',
        created_at: roleObj?.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: roleObj?.updatedAt?.toISOString() || new Date().toISOString(),
        permissions: (roleObj?.permissions || []).map((permission: any) => ({
          id: permission.id,
          name: permission.name,
          guard_name: permission.guard_name || 'web',
          created_at: permission.createdAt?.toISOString() || new Date().toISOString(),
          updated_at: permission.updatedAt?.toISOString() || new Date().toISOString(),
          pivot: {
            role_id: roleObj?.id.toString(),
            permission_id: permission.id.toString()
          }
        }))
      };

      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: formattedRole
      });
    } catch (error: any) {
      Logger.error('Error al crear rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /api/roles/:id - Actualizar rol
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, permissions } = req.body;

      Logger.log('Actualizando rol:', { id, name, permissions });

      // Buscar el rol
      const role = await RoleModel.findOne({ id: parseInt(id) });
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      // Verificar si es un rol del sistema
      if ((role as any).system_reserve === 1) {
        res.status(400).json({
          success: false,
          message: 'No se puede modificar un rol del sistema'
        });
        return;
      }

      // Actualizar nombre si se proporciona
      if (name && name !== (role as any).name) {
        const existingRole = await RoleModel.findOne({ name, id: { $ne: parseInt(id) } });
        if (existingRole) {
          res.status(400).json({
            success: false,
            message: 'Ya existe un rol con ese nombre'
          });
          return;
        }
        (role as any).name = name;
      }

      // Actualizar permisos si se proporcionan
      if (permissions && Array.isArray(permissions)) {
        // Eliminar permisos existentes
        await RolePermissionModel.deleteMany({ role_id: parseInt(id) });

        // Agregar nuevos permisos
        if (permissions.length > 0) {
          // Verificar que los permisos existen
          const existingPermissions = await PermissionModel.find({ 
            id: { $in: permissions } 
          });

          if (existingPermissions.length !== permissions.length) {
            res.status(400).json({
              success: false,
              message: 'Algunos permisos no existen'
            });
            return;
          }

          // Crear nuevas relaciones
          const rolePermissions = permissions.map((permissionId: number) => ({
            role_id: parseInt(id),
            permission_id: permissionId
          }));

          await RolePermissionModel.insertMany(rolePermissions);

          // Actualizar el rol con los nuevos permisos
          (role as any).permissions = existingPermissions.map((p: any) => p._id);
        } else {
          (role as any).permissions = [];
        }
      }

      await (role as any).save();

      // Obtener el rol actualizado con permisos
      const updatedRole = await RoleModel.findOne({ id: parseInt(id) })
        .populate({
          path: 'permissions',
          model: 'Permission',
          select: 'id name guard_name created_at updated_at'
        });

      const roleObj = (updatedRole as any)?.toObject();
      const formattedRole = {
        id: roleObj?.id,
        name: roleObj?.name,
        guard_name: roleObj?.guard_name || 'web',
        system_reserve: roleObj?.system_reserve?.toString() || '0',
        created_at: roleObj?.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: roleObj?.updatedAt?.toISOString() || new Date().toISOString(),
        permissions: (roleObj?.permissions || []).map((permission: any) => ({
          id: permission.id,
          name: permission.name,
          guard_name: permission.guard_name || 'web',
          created_at: permission.createdAt?.toISOString() || new Date().toISOString(),
          updated_at: permission.updatedAt?.toISOString() || new Date().toISOString(),
          pivot: {
            role_id: roleObj?.id.toString(),
            permission_id: permission.id.toString()
          }
        }))
      };

      res.status(200).json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: formattedRole
      });
    } catch (error: any) {
      Logger.error('Error al actualizar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /api/roles/:id - Eliminar rol
  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      Logger.log('Eliminando rol:', { id });

      // Buscar el rol
      const role = await RoleModel.findOne({ id: parseInt(id) });
      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
        return;
      }

      // Verificar si es un rol del sistema
      if ((role as any).system_reserve === 1) {
        res.status(400).json({
          success: false,
          message: 'No se puede eliminar un rol del sistema'
        });
        return;
      }

      // Verificar si hay usuarios usando este rol
      const UserModel = require('../../infrastructure/database/models/UserModel').default;
      const usersWithRole = await UserModel.find({ role_id: parseInt(id) });
      
      if (usersWithRole.length > 0) {
        res.status(400).json({
          success: false,
          message: `No se puede eliminar el rol porque ${usersWithRole.length} usuario(s) lo están usando`
        });
        return;
      }

      // Eliminar relaciones de permisos
      await RolePermissionModel.deleteMany({ role_id: parseInt(id) });

      // Eliminar el rol
      await RoleModel.findByIdAndDelete((role as any)._id);

      res.status(200).json({
        success: true,
        message: 'Rol eliminado exitosamente'
      });
    } catch (error: any) {
      Logger.error('Error al eliminar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/modules - Obtener permisos organizados por módulos
  async getModules(_req: Request, res: Response): Promise<void> {
    try {
      Logger.log('Obteniendo módulos y permisos...');

      const permissions = await PermissionModel.find().sort({ name: 1 });

      // Organizar permisos por módulos
      const modules = [
        {
          id: 1,
          name: 'Usuarios',
          isChecked: false,
          permissions: permissions
            .filter((p: any) => p.name.startsWith('user.'))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              isChecked: false
            }))
        },
        {
          id: 2,
          name: 'Roles',
          isChecked: false,
          permissions: permissions
            .filter((p: any) => p.name.startsWith('role.'))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              isChecked: false
            }))
        },
        {
          id: 3,
          name: 'Productos',
          isChecked: false,
          permissions: permissions
            .filter((p: any) => p.name.startsWith('product.'))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              isChecked: false
            }))
        },
        {
          id: 4,
          name: 'Categorías',
          isChecked: false,
          permissions: permissions
            .filter((p: any) => p.name.startsWith('category.'))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              isChecked: false
            }))
        },
        {
          id: 5,
          name: 'Órdenes',
          isChecked: false,
          permissions: permissions
            .filter((p: any) => p.name.startsWith('order.'))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              isChecked: false
            }))
        },
        {
          id: 6,
          name: 'Configuraciones',
          isChecked: false,
          permissions: permissions
            .filter((p: any) => p.name.startsWith('setting.'))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              isChecked: false
            }))
        }
      ].filter(module => module.permissions.length > 0); // Solo mostrar módulos con permisos

      res.status(200).json({
        success: true,
        data: modules
      });
    } catch (error: any) {
      Logger.error('Error al obtener módulos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
