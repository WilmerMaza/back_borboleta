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
      Logger.log('Iniciando proceso de login para email:', command.email);

      // Buscar usuario por email
      const user = await this.userRepository.findByEmail(command.email);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const isPasswordValid = await this.authService.comparePassword(
        command.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token JWT
      const token = this.authService.generateToken(user.id!, user.email);

      // Preparar respuesta del usuario (sin contraseña)
      const { password, ...userWithoutPassword } = user;

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


