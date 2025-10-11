import { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { PermissionCreateRequest, PermissionUpdateRequest } from '../../domain/entities/Permission';
import { AuthenticatedRequest } from '../../middleware/auth';

@injectable()
export class PermissionController {
  constructor(
    @inject('PermissionRepository') private permissionRepository: IPermissionRepository
  ) {}

  // GET /api/permissions - Obtener todos los permisos
  async getPermissions(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(_req.query.page as string) || 1;
      const limit = parseInt(_req.query.limit as string) || 50;
      const module = _req.query.module as string;
      const action = _req.query.action as string;
      const status = _req.query.status === 'true' ? true : _req.query.status === 'false' ? false : undefined;

      const skip = (page - 1) * limit;

      const permissions = await this.permissionRepository.findAll({
        skip,
        limit,
        module,
        action,
        status
      });

      const total = await this.permissionRepository.count({ module, action, status });

      res.status(200).json({
        success: true,
        data: {
          permissions,
          pagination: {
            current_page: page,
            per_page: limit,
            total,
            last_page: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      console.error('Error al obtener permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/permissions/:id - Obtener permiso por ID
  async getPermissionById(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } =  _req.params;
      const permissionId = parseInt(id);

      if (isNaN(permissionId) || permissionId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de permiso inválido'
        });
        return;
      }

      const permission = await this.permissionRepository.findById(permissionId);

      if (!permission) {
        res.status(404).json({
          success: false,
          message: 'Permiso no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          permission
        }
      });
    } catch (error: any) {
      console.error('Error al obtener permiso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // POST /api/permissions - Crear permiso
  async createPermission(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const permissionData: PermissionCreateRequest = _req.body;

      // Validaciones básicas
      if (!permissionData.name || !permissionData.slug || !permissionData.guard_name || !permissionData.module || !permissionData.action) {
        res.status(400).json({
          success: false,
          message: 'Nombre, slug, guard_name, módulo y acción son requeridos'
        });
        return;
      }

      // Verificar si el slug ya existe
      const existingPermission = await this.permissionRepository.findBySlug(permissionData.slug);
      if (existingPermission) {
        res.status(400).json({
          success: false,
          message: 'El slug ya está en uso'
        });
        return;
      }

      const permission = await this.permissionRepository.create({
        ...permissionData,
        status: permissionData.status ?? true
      });

      res.status(201).json({
        success: true,
        message: 'Permiso creado exitosamente',
        data: {
          permission
        }
      });
    } catch (error: any) {
      console.error('Error al crear permiso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // PUT /api/permissions/:id - Actualizar permiso
  async updatePermission(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = _req.params;
      const permissionId = parseInt(id);

      if (isNaN(permissionId) || permissionId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de permiso inválido'
        });
        return;
      }

      const updateData: PermissionUpdateRequest = _req.body;

      // Verificar que el permiso existe
      const existingPermission = await this.permissionRepository.findById(permissionId);
      if (!existingPermission) {
        res.status(404).json({
          success: false,
          message: 'Permiso no encontrado'
        });
        return;
      }

      // Verificar si el slug ya existe en otro permiso
      if (updateData.slug && updateData.slug !== existingPermission.slug) {
        const permissionWithSlug = await this.permissionRepository.findBySlug(updateData.slug);
        if (permissionWithSlug && permissionWithSlug.id !== permissionId) {
          res.status(400).json({
            success: false,
            message: 'El slug ya está en uso por otro permiso'
          });
          return;
        }
      }

      const updatedPermission = await this.permissionRepository.update(permissionId, updateData);

      res.status(200).json({
        success: true,
        message: 'Permiso actualizado exitosamente',
        data: {
          permission: updatedPermission
        }
      });
    } catch (error: any) {
      console.error('Error al actualizar permiso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // DELETE /api/permissions/:id - Eliminar permiso
  async deletePermission(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = _req.params;
      const permissionId = parseInt(id);

      if (isNaN(permissionId) || permissionId <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de permiso inválido'
        });
        return;
      }

      const deleted = await this.permissionRepository.delete(permissionId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Permiso no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Permiso eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar permiso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/permissions/modules - Obtener módulos de permisos
  async getPermissionModules(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const permissions = await this.permissionRepository.findAll({ limit: 1000 });
      
      // Agrupar permisos por módulo
      const modulesMap = new Map<string, any[]>();
      
      permissions.forEach(permission => {
        const module = permission.module;
        if (!modulesMap.has(module)) {
          modulesMap.set(module, []);
        }
        modulesMap.get(module)!.push({
          id: permission.id,
          name: permission.name,
          slug: permission.slug,
          action: permission.action,
          resource: permission.resource
        });
      });

      // Convertir a array de módulos
      const modules = Array.from(modulesMap.entries()).map(([moduleName, permissions]) => ({
        module: moduleName,
        permissions: permissions
      }));

      res.status(200).json({
        success: true,
        data: {
          modules
        }
      });
    } catch (error: any) {
      console.error('Error al obtener módulos de permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}
