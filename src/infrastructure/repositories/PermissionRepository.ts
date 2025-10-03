import { injectable } from 'tsyringe';
import { Logger } from '../../shared/utils/logger';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { IPermission } from '../../domain/entities/Permission';
import PermissionModel from '../database/models/PermissionModel';

@injectable()
export class PermissionRepository implements IPermissionRepository {
  async create(permission: IPermission): Promise<IPermission> {
    try {
      const newPermission = new PermissionModel(permission);
      const savedPermission = await (newPermission as any).save();
      return (savedPermission as any).toObject();
    } catch (error) {
      Logger.error('Error al crear permiso:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<IPermission | null> {
    try {
      const permission = await PermissionModel.findOne({ id, status: true });
      return permission ? (permission as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar permiso con ID ${id}:`, error);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<IPermission | null> {
    try {
      const permission = await PermissionModel.findOne({ slug, status: true });
      return permission ? (permission as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar permiso con slug ${slug}:`, error);
      throw error;
    }
  }

  async findAll(params?: {
    skip?: number;
    limit?: number;
    module?: string;
    action?: string;
    status?: boolean;
  }): Promise<IPermission[]> {
    try {
      let query = PermissionModel.find();

      // Aplicar filtros
      if (params?.status !== undefined) {
        query = query.find({ status: params.status });
      } else {
        query = query.find({ status: true });
      }

      if (params?.module) {
        query = query.find({ module: params.module });
      }

      if (params?.action) {
        query = query.find({ action: params.action });
      }

      // Aplicar paginación
      if (params?.skip) {
        query = query.skip(params.skip);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }

      // Ordenar por nombre
      query = query.sort({ name: 1 });

      const permissions = await query.exec();
      return permissions.map(permission => (permission as any).toObject());
    } catch (error) {
      Logger.error('Error al obtener permisos:', error);
      throw error;
    }
  }

  async update(id: number, permissionData: Partial<IPermission>): Promise<IPermission | null> {
    try {
      const updatedPermission = await PermissionModel.findOneAndUpdate(
        { id },
        { $set: permissionData },
        { new: true }
      );
      return updatedPermission ? (updatedPermission as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al actualizar permiso con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await PermissionModel.findOneAndUpdate(
        { id },
        { $set: { status: false } },
        { new: true }
      );
      return !!result;
    } catch (error) {
      Logger.error(`Error al eliminar permiso con ID ${id}:`, error);
      throw error;
    }
  }

  async count(params?: { module?: string; action?: string; status?: boolean }): Promise<number> {
    try {
      let query = PermissionModel.find();

      if (params?.status !== undefined) {
        query = query.find({ status: params.status });
      } else {
        query = query.find({ status: true });
      }

      if (params?.module) {
        query = query.find({ module: params.module });
      }

      if (params?.action) {
        query = query.find({ action: params.action });
      }

      return await query.countDocuments();
    } catch (error) {
      Logger.error('Error al contar permisos:', error);
      throw error;
    }
  }
}


