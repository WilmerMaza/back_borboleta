import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository';
import { AuthService } from '../../services/AuthService';
import { Logger } from '../../../shared/utils/logger';

export interface UnifiedLoginCommand {
  email: string;
  password: string;
  loginType: 'frontend' | 'backoffice';
}

@injectable()
export class UnifiedLoginHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('RoleRepository') private roleRepository: IRoleRepository,
    @inject('AuthService') private authService: AuthService
  ) {}

  async handle(command: UnifiedLoginCommand): Promise<{
    user: any;
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    try {
      Logger.log(`Iniciando proceso de login ${command.loginType}:`, command.email);

      // Buscar usuario en la colección User
      const user = await this.userRepository.findByEmail(command.email);
      
      if (!user) {
        Logger.log(`❌ Usuario no encontrado (${command.loginType}):`, command.email);
        throw new Error('Credenciales inválidas');
      }

      Logger.log(`✅ Usuario encontrado (${command.loginType}):`, {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id
      });

      // Verificar contraseña
      const isPasswordValid = await this.authService.comparePassword(
        command.password,
        user.password
      );

      if (!isPasswordValid) {
        Logger.log(`❌ Contraseña inválida (${command.loginType}):`, command.email);
        throw new Error('Credenciales inválidas');
      }

      Logger.log(`✅ Contraseña válida (${command.loginType}):`, command.email);

      // Validar acceso según el tipo de login
      await this.validateAccess(user, command.loginType);

      // Generar token JWT
      const token = this.authService.generateToken(user.id!, user.email);

      // Preparar respuesta del usuario (sin contraseña)
      const { password, ...userWithoutPassword } = user;

      // Obtener información del rol
      const roleInfo = await this.getRoleInfo(user.role_id);

      Logger.log(`✅ Usuario autenticado exitosamente (${command.loginType}):`, {
        email: userWithoutPassword.email,
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        role: roleInfo?.name || 'consumer'
      });

      return {
        user: {
          ...userWithoutPassword,
          role_name: roleInfo?.name || 'consumer',
          role_slug: roleInfo?.slug || 'consumer'
        },
        access_token: token,
        token_type: 'Bearer',
        expires_in: 86400 // 24 horas en segundos
      };
    } catch (error: any) {
      Logger.error(`Error en UnifiedLoginHandler (${command.loginType}):`, error);
      throw error;
    }
  }

  private async validateAccess(user: any, loginType: 'frontend' | 'backoffice'): Promise<void> {
    const roleInfo = await this.getRoleInfo(user.role_id);
    
    if (!roleInfo) {
      throw new Error('Rol no válido');
    }

    if (loginType === 'frontend') {
      if (roleInfo.slug !== 'consumer') {
        throw new Error('Solo los usuarios cliente pueden acceder a la aplicación móvil');
      }
    } else if (loginType === 'backoffice') {
      if (roleInfo.slug === 'consumer') {
        throw new Error('Los usuarios cliente no pueden acceder al panel administrativo');
      }
    }
  }

  private async getRoleInfo(roleId: number): Promise<any> {
    try {
      if (!roleId) return null;
      
      const role = await this.roleRepository.findById(roleId);
      return role;
    } catch (error) {
      Logger.error('Error al obtener información del rol:', error);
      return null;
    }
  }
}
