import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuthService } from '../../services/AuthService';
import { UpdatePasswordCommand } from '../../commands/user/UpdatePasswordCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class UpdatePasswordHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: UpdatePasswordCommand): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      Logger.log('Actualizando contraseña para:', command.email);

      // Validar que las contraseñas coincidan
      if (command.password !== command.password_confirmation) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Verificar token de recuperación
      try {
        this.authService.verifyToken(command.token);
      } catch (error) {
        throw new Error('Token de recuperación inválido o expirado');
      }

      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(command.email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar contraseña
      await this.userRepository.updatePassword(command.email, command.password);

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };
    } catch (error: any) {
      Logger.error('Error en UpdatePasswordHandler:', error);
      throw error;
    }
  }
}


