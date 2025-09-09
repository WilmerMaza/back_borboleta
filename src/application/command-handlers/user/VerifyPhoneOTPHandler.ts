import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuthService } from '../../services/AuthService';
import { VerifyPhoneOTPCommand } from '../../commands/user/VerifyPhoneOTPCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class VerifyPhoneOTPHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: VerifyPhoneOTPCommand): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      Logger.log('Verificando OTP por teléfono:', command.phone);

      // Verificar OTP
      const identifier = `${command.phone}_${command.country_code}`;
      const isValidOTP = this.authService.verifyOTP(identifier, command.token);
      if (!isValidOTP) {
        throw new Error('OTP inválido o expirado');
      }

      // Buscar usuario
      const user = await this.userRepository.findByPhone(command.phone, command.country_code);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        message: 'Teléfono verificado exitosamente'
      };
    } catch (error: any) {
      Logger.error('Error en VerifyPhoneOTPHandler:', error);
      throw error;
    }
  }
}


