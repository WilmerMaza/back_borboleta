import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuthService } from '../../services/AuthService';
import { VerifyEmailOTPCommand } from '../../commands/user/VerifyEmailOTPCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class VerifyEmailOTPHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: VerifyEmailOTPCommand): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      Logger.log('Verificando OTP por email:', command.email);

      // Verificar OTP
      const isValidOTP = this.authService.verifyOTP(command.email, command.token);
      if (!isValidOTP) {
        throw new Error('OTP inválido o expirado');
      }

      // Buscar usuario y marcar email como verificado
      const user = await this.userRepository.findByEmail(command.email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar usuario con email verificado
      await this.userRepository.update(user.id!, {
        email_verified_at: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Email verificado exitosamente'
      };
    } catch (error: any) {
      Logger.error('Error en VerifyEmailOTPHandler:', error);
      throw error;
    }
  }
}


