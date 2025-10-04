import { injectable, inject } from 'tsyringe';
import { IAdminUserRepository } from '../../../domain/repositories/IAdminUserRepository';
import { DeleteAdminUserCommand } from '../../commands/admin/DeleteAdminUserCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class DeleteAdminUserHandler {
  constructor(
    @inject('AdminUserRepository') private adminUserRepository: IAdminUserRepository
  ) {}

  async handle(command: DeleteAdminUserCommand): Promise<boolean> {
    try {
      Logger.log('Eliminando AdminUser:', command.id);

      // Verificar si el usuario existe
      const existingUser = await this.adminUserRepository.findById(command.id);
      if (!existingUser) {
        throw new Error('AdminUser no encontrado');
      }

      Logger.log('AdminUser encontrado, eliminando...', {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name
      });

      // Eliminar el usuario
      const deleted = await this.adminUserRepository.delete(command.id);

      if (!deleted) {
        throw new Error('Error al eliminar el AdminUser');
      }

      Logger.log('✅ AdminUser eliminado exitosamente:', {
        id: command.id,
        email: existingUser.email
      });

      return true;
    } catch (error: any) {
      Logger.error('Error en DeleteAdminUserHandler:', error);
      throw error;
    }
  }
}
