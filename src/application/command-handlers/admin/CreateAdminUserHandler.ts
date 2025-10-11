import { injectable, inject } from 'tsyringe';
import { IAdminUserRepository } from '../../../domain/repositories/IAdminUserRepository';
import { CreateAdminUserCommand } from '../../commands/admin/CreateAdminUserCommand';
import { AuthService } from '../../services/AuthService';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class CreateAdminUserHandler {
  constructor(
    @inject('AdminUserRepository') private adminUserRepository: IAdminUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: CreateAdminUserCommand): Promise<any> {
    try {
      Logger.log('Creando AdminUser:', {
        name: command.name,
        email: command.email,
        role_id: command.role_id
      });

      // Verificar si el email ya existe
      const existingUser = await this.adminUserRepository.findByEmail(command.email);
      if (existingUser) {
        throw new Error('El email ya existe en el sistema');
      }

      // Hash de la contraseña
      const hashedPassword = await this.authService.hashPassword(command.password);

      // Crear el AdminUser
      const adminUserData = {
        name: command.name,
        email: command.email,
        password: hashedPassword,
        role_id: command.role_id,
        employee_id: command.employee_id,
        department: command.department,
        position: command.position,
        access_level: command.access_level || 'limited',
        phone: command.phone,
        is_active: true,
        status: true
      };

      const createdUser = await this.adminUserRepository.create(adminUserData);

      Logger.log('✅ AdminUser creado exitosamente:', {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name
      });

      // Retornar sin la contraseña
      const { password, ...userWithoutPassword } = createdUser;
      return userWithoutPassword;
    } catch (error: any) {
      Logger.error('Error en CreateAdminUserHandler:', error);
      throw error;
    }
  }
}


