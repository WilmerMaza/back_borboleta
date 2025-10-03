import { Response } from 'express';
import { injectable } from 'tsyringe';
import { container } from 'tsyringe';
import { CreateAdminUserHandler } from '../../application/command-handlers/admin/CreateAdminUserHandler';
import { UpdateAdminUserHandler } from '../../application/command-handlers/admin/UpdateAdminUserHandler';
import { DeleteAdminUserHandler } from '../../application/command-handlers/admin/DeleteAdminUserHandler';
import { GetAdminUserByIdHandler } from '../../application/query-handlers/admin/GetAdminUserByIdHandler';
import { GetAdminUsersHandler } from '../../application/query-handlers/admin/GetAdminUsersHandler';
import { CreateAdminUserCommand } from '../../application/commands/admin/CreateAdminUserCommand';
import { UpdateAdminUserCommand } from '../../application/commands/admin/UpdateAdminUserCommand';
import { DeleteAdminUserCommand } from '../../application/commands/admin/DeleteAdminUserCommand';
import { GetAdminUserByIdQuery } from '../../application/queries/admin/GetAdminUserByIdQuery';
import { GetAdminUsersQuery } from '../../application/queries/admin/GetAdminUsersQuery';
import { AuthenticatedRequest } from '../../middleware/auth';
import { Logger } from '../../shared/utils/logger';

@injectable()
export class AdminUserController {
  // POST /api/admin/users - Crear usuario administrativo
  createAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        email,
        password,
        role_id,
        employee_id,
        department,
        position,
        access_level,
        phone
      } = req.body;

      Logger.log('Solicitud de creación de AdminUser recibida:', { name, email, role_id });

      // Validaciones básicas
      if (!name || !email || !password || !role_id) {
        res.status(400).json({
          success: false,
          message: 'Nombre, email, contraseña y rol son requeridos'
        });
        return;
      }

      const createHandler = container.resolve(CreateAdminUserHandler);
      const command = new CreateAdminUserCommand(
        name,
        email,
        password,
        role_id,
        employee_id,
        department,
        position,
        access_level,
        phone
      );

      const createdUser = await createHandler.handle(command);

      Logger.log('✅ AdminUser creado exitosamente:', {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name
      });

      res.status(201).json({
        success: true,
        message: 'Usuario administrativo creado exitosamente',
        data: createdUser
      });
    } catch (error: any) {
      Logger.error('Error al crear AdminUser:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  // GET /api/admin/users - Obtener lista de usuarios administrativos
  getAdminUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;
      const search = req.query.search as string;
      const roleId = req.query.role_id ? parseInt(req.query.role_id as string) : undefined;

      Logger.log('Solicitud de lista de AdminUsers recibida:', { page, limit, search, roleId });

      const getHandler = container.resolve(GetAdminUsersHandler);
      const query = new GetAdminUsersQuery(page, limit, search, roleId);

      const result = await getHandler.handle(query);

      Logger.log('✅ Lista de AdminUsers obtenida:', {
        total: result.pagination.total,
        count: result.admin_users.length
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      Logger.error('Error al obtener lista de AdminUsers:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  // GET /api/admin/users/:id - Obtener usuario administrativo por ID
  getAdminUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      Logger.log('Solicitud de AdminUser por ID recibida:', { id });

      const getHandler = container.resolve(GetAdminUserByIdHandler);
      const query = new GetAdminUserByIdQuery(parseInt(id));

      const adminUser = await getHandler.handle(query);

      Logger.log('✅ AdminUser obtenido:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name
      });

      res.status(200).json({
        success: true,
        data: adminUser
      });
    } catch (error: any) {
      Logger.error('Error al obtener AdminUser por ID:', error);

      if (error.message === 'AdminUser no encontrado') {
        res.status(404).json({
          success: false,
          message: 'Usuario administrativo no encontrado'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  // PUT /api/admin/users/:id - Actualizar usuario administrativo
  updateAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      Logger.log('Solicitud de actualización de AdminUser recibida:', { id, updateData });

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const updateHandler = container.resolve(UpdateAdminUserHandler);
      const command = new UpdateAdminUserCommand(
        parseInt(id),
        updateData.name,
        updateData.email,
        updateData.role_id,
        updateData.employee_id,
        updateData.department,
        updateData.position,
        updateData.access_level,
        updateData.phone,
        updateData.is_active
      );

      const updatedUser = await updateHandler.handle(command);

      Logger.log('✅ AdminUser actualizado exitosamente:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      });

      res.status(200).json({
        success: true,
        message: 'Usuario administrativo actualizado exitosamente',
        data: updatedUser
      });
    } catch (error: any) {
      Logger.error('Error al actualizar AdminUser:', error);

      if (error.message === 'AdminUser no encontrado') {
        res.status(404).json({
          success: false,
          message: 'Usuario administrativo no encontrado'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };

  // DELETE /api/admin/users/:id - Eliminar usuario administrativo
  deleteAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      Logger.log('Solicitud de eliminación de AdminUser recibida:', { id });

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Verificar que no se esté eliminando a sí mismo
      if (parseInt(id) === req.user.userId) {
        res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propia cuenta'
        });
        return;
      }

      const deleteHandler = container.resolve(DeleteAdminUserHandler);
      const command = new DeleteAdminUserCommand(parseInt(id));

      await deleteHandler.handle(command);

      Logger.log('✅ AdminUser eliminado exitosamente:', { id });

      res.status(200).json({
        success: true,
        message: 'Usuario administrativo eliminado exitosamente'
      });
    } catch (error: any) {
      Logger.error('Error al eliminar AdminUser:', error);

      if (error.message === 'AdminUser no encontrado') {
        res.status(404).json({
          success: false,
          message: 'Usuario administrativo no encontrado'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };
}