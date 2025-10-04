import { injectable, inject } from 'tsyringe';
import { IAdminUserRepository } from '../../../domain/repositories/IAdminUserRepository';
import { AuthService } from '../../services/AuthService';
import { AdminUserLoginCommand } from '../../commands/admin/AdminUserLoginCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class AdminUserLoginHandler {
  constructor(
    @inject('AdminUserRepository') private adminUserRepository: IAdminUserRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: AdminUserLoginCommand): Promise<{
    user: any;
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    try {
      Logger.log('Iniciando proceso de login para AdminUser:', command.email);

      // Buscar usuario administrativo
      const adminUser = await this.adminUserRepository.findByEmail(command.email);
      
      if (!adminUser) {
        Logger.log('❌ AdminUser no encontrado:', command.email);
        throw new Error('Credenciales inválidas');
      }

      Logger.log('✅ AdminUser encontrado:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name
      });

      // Verificar contraseña
      const isPasswordValid = await this.authService.comparePassword(
        command.password,
        adminUser.password
      );

      if (!isPasswordValid) {
        Logger.log('❌ Contraseña inválida para AdminUser:', command.email);
        throw new Error('Credenciales inválidas');
      }

      Logger.log('✅ Contraseña válida para AdminUser:', command.email);

      // Generar token JWT
      const token = this.authService.generateToken(adminUser.id!, adminUser.email);

      // Preparar respuesta del usuario (sin contraseña)
      const { password, ...userWithoutPassword } = adminUser;

      Logger.log('✅ AdminUser autenticado exitosamente:', {
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
      Logger.error('Error en AdminUserLoginHandler:', error);
      throw error;
    }
  }
}
