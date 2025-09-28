import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuthService } from '../../services/AuthService';
import { ForgotPasswordCommand } from '../../commands/user/ForgotPasswordCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class ForgotPasswordHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: ForgotPasswordCommand): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      Logger.log('Procesando solicitud de recuperación de contraseña para:', command.email);

      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(command.email);
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return {
          success: true,
          message: 'Si el email existe, se ha enviado un enlace de recuperación'
        };
      }

      // Generar token de recuperación
      const resetToken = this.authService.generateToken(user.id!, user.email);
      
      // En un entorno real, aquí enviarías un email con el token
      Logger.log(`Token de recuperación generado para ${command.email}: ${resetToken}`);

      return {
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación'
      };
    } catch (error: any) {
      Logger.error('Error en ForgotPasswordHandler:', error);
      throw error;
    }
  }
}


