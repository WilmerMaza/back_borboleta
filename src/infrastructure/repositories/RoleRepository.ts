import { injectable } from 'tsyringe';
import { Logger } from '../../shared/utils/logger';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { IRole } from '../../domain/entities/Role';
import RoleModel from '../database/models/RoleModel';

@injectable()
export class RoleRepository implements IRoleRepository {
  async create(role: IRole): Promise<IRole> {
    try {
      const newRole = new RoleModel(role);
      const savedRole = await (newRole as any).save();
      return (savedRole as any).toObject();
    } catch (error) {
      Logger.error('Error al crear rol:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<IRole | null> {
    try {
      const role = await RoleModel.findOne({ id, status: true });
      return role ? (role as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar rol con ID ${id}:`, error);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<IRole | null> {
    try {
      const role = await RoleModel.findOne({ slug, status: true });
      return role ? (role as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar rol con slug ${slug}:`, error);
      throw error;
    }
  }

  async findAll(params?: {
    skip?: number;
    limit?: number;
    status?: boolean;
  }): Promise<IRole[]> {
    try {
      let query = RoleModel.find();

      // Aplicar filtros
      if (params?.status !== undefined) {
        query = query.find({ status: params.status });
      } else {
        query = query.find({ status: true });
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

      const roles = await query.exec();
      return roles.map(role => (role as any).toObject());
    } catch (error) {
      Logger.error('Error al obtener roles:', error);
      throw error;
    }
  }

  async update(id: number, roleData: Partial<IRole>): Promise<IRole | null> {
    try {
      const updatedRole = await RoleModel.findOneAndUpdate(
        { id },
        { $set: roleData },
        { new: true }
      );
      return updatedRole ? (updatedRole as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al actualizar rol con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await RoleModel.findOneAndUpdate(
        { id },
        { $set: { status: false } },
        { new: true }
      );
      return !!result;
    } catch (error) {
      Logger.error(`Error al eliminar rol con ID ${id}:`, error);
      throw error;
    }
  }

  async count(params?: { status?: boolean }): Promise<number> {
    try {
      let query = RoleModel.find();

      if (params?.status !== undefined) {
        query = query.find({ status: params.status });
      } else {
        query = query.find({ status: true });
      }

      return await query.countDocuments();
    } catch (error) {
      Logger.error('Error al contar roles:', error);
      throw error;
    }
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<IRole | null> {
    try {
      const role = await RoleModel.findOne({ id: roleId });
      if (!role) {
        return null;
      }

      // Agregar permisos únicos
      const currentPermissions = role.permissions || [];
      const newPermissions = [...new Set([...currentPermissions, ...permissionIds])];
      
      const updatedRole = await RoleModel.findOneAndUpdate(
        { id: roleId },
        { $set: { permissions: newPermissions } },
        { new: true }
      );
      
      return updatedRole ? (updatedRole as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al asignar permisos al rol ${roleId}:`, error);
      throw error;
    }
  }

  async removePermissions(roleId: number, permissionIds: number[]): Promise<IRole | null> {
    try {
      const role = await RoleModel.findOne({ id: roleId });
      if (!role) {
        return null;
      }

      // Remover permisos específicos
      const currentPermissions = role.permissions || [];
      const newPermissions = currentPermissions.filter(id => !permissionIds.includes(id));
      
      const updatedRole = await RoleModel.findOneAndUpdate(
        { id: roleId },
        { $set: { permissions: newPermissions } },
        { new: true }
      );
      
      return updatedRole ? (updatedRole as any).toObject() : null;
    } catch (error) {
      Logger.error(`Error al remover permisos del rol ${roleId}:`, error);
      throw error;
    }
  }
}




