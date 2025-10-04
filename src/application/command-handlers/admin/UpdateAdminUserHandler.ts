import { injectable, inject } from 'tsyringe';
import { IAdminUserRepository } from '../../../domain/repositories/IAdminUserRepository';
import { UpdateAdminUserCommand } from '../../commands/admin/UpdateAdminUserCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class UpdateAdminUserHandler {
  constructor(
    @inject('AdminUserRepository') private adminUserRepository: IAdminUserRepository
  ) {}

  async handle(command: UpdateAdminUserCommand): Promise<any> {
    try {
      Logger.log('Actualizando AdminUser:', {
        id: command.id,
        name: command.name,
        email: command.email,
        role_id: command.role_id
      });

      // Verificar si el usuario existe
      const existingUser = await this.adminUserRepository.findById(command.id);
      if (!existingUser) {
        throw new Error('AdminUser no encontrado');
      }

      // Verificar si el email ya existe en otro usuario
      if (command.email && command.email !== existingUser.email) {
        const userWithEmail = await this.adminUserRepository.findByEmail(command.email);
        if (userWithEmail && userWithEmail.id !== command.id) {
          throw new Error('El email ya existe en el sistema');
        }
      }

      // Preparar datos para actualización
      const updateData: any = {};
      if (command.name) updateData.name = command.name;
      if (command.email) updateData.email = command.email;
      if (command.role_id) updateData.role_id = command.role_id;
      if (command.employee_id) updateData.employee_id = command.employee_id;
      if (command.department) updateData.department = command.department;
      if (command.position) updateData.position = command.position;
      if (command.access_level) updateData.access_level = command.access_level;
      if (command.phone) updateData.phone = command.phone;
      if (command.is_active !== undefined) updateData.is_active = command.is_active;

      const updatedUser = await this.adminUserRepository.update(command.id, updateData);

      Logger.log('✅ AdminUser actualizado exitosamente:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      });

      // Retornar sin la contraseña
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error: any) {
      Logger.error('Error en UpdateAdminUserHandler:', error);
      throw error;
    }
  }
}
