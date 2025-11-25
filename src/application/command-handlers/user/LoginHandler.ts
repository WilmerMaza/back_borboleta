import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuthService } from '../../services/AuthService';
import { LoginCommand } from '../../commands/user/LoginCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class LoginHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: LoginCommand): Promise<{
    user: any;
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    try {
      Logger.log('Iniciando proceso de login para usuario normal:', command.email);

      // Buscar usuario normal
      const user = await this.userRepository.findByEmail(command.email);
      
      if (!user) {
        Logger.log('❌ Usuario normal no encontrado:', command.email);
        throw new Error('Credenciales inválidas');
      }

      Logger.log('✅ Usuario normal encontrado:', {
        id: user.id,
        email: user.email,
        name: user.name
      });

      // Verificar contraseña
      const isPasswordValid = await this.authService.comparePassword(
        command.password,
        user.password
      );

      if (!isPasswordValid) {
        Logger.log('❌ Contraseña inválida para usuario normal:', command.email);
        throw new Error('Credenciales inválidas');
      }

      Logger.log('✅ Contraseña válida para usuario normal:', command.email);

      // Generar token JWT
      const token = this.authService.generateToken(user.id!, user.email);

      // Preparar respuesta del usuario (sin contraseña)
      // El password ya debería estar excluido por el transform del modelo,
      // pero lo excluimos manualmente por seguridad
      const userWithoutPassword: any = { ...user };
      delete userWithoutPassword.password;

      Logger.log('✅ Usuario normal autenticado exitosamente:', {
        email: userWithoutPassword.email,
        id: userWithoutPassword.id,
        name: userWithoutPassword.name
      });

      return {
        user: userWithoutPassword,
        access_token: token,
        token_type: 'Bearer',
        expires_in: 86400 // 24 horas en segundos
      };
    } catch (error: any) {
      Logger.error('Error en LoginHandler:', error);
      throw error;
    }
  }
}