import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuthService } from '../../services/AuthService';
import { LoginPhoneCommand } from '../../commands/user/LoginPhoneCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class LoginPhoneHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: LoginPhoneCommand): Promise<{
    user: any;
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    try {
      Logger.log('Iniciando proceso de login por teléfono:', command.phone);

      // Buscar usuario por teléfono
      const user = await this.userRepository.findByPhone(command.phone, command.country_code);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Generar OTP
      const otp = this.authService.generateOTP();
      this.authService.storeOTP(`${command.phone}_${command.country_code}`, otp);

      // En un entorno real, aquí enviarías el OTP por SMS
      Logger.log(`OTP generado para ${command.phone}: ${otp}`);

      // Generar token JWT
      const token = this.authService.generateToken(user.id!, user.email);

      // Preparar respuesta del usuario (sin contraseña)
      // El password ya debería estar excluido por el transform del modelo,
      // pero lo excluimos manualmente por seguridad
      const userWithoutPassword: any = { ...user };
      delete userWithoutPassword.password;

      return {
        user: userWithoutPassword,
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600
      };
    } catch (error: any) {
      Logger.error('Error en LoginPhoneHandler:', error);
      throw error;
    }
  }
}


