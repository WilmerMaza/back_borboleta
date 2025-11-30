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
      // El password ya debería estar excluido por el transform del modelo,
      // pero lo excluimos manualmente por seguridad
      const userWithoutPassword: any = { ...user };
      delete userWithoutPassword.password;

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
    Logger.log(`Validando acceso para usuario ${user.email} con role_id: ${user.role_id}, loginType: ${loginType}`);
    
    const roleInfo = await this.getRoleInfo(user.role_id);
    
    if (!roleInfo) {
      Logger.error(`❌ Rol no encontrado para usuario ${user.email} con role_id: ${user.role_id}`);
      throw new Error(`Rol no válido. El usuario no tiene un rol asignado válido (role_id: ${user.role_id})`);
    }

    Logger.log(`✅ Rol encontrado:`, {
      id: roleInfo.id,
      name: roleInfo.name,
      slug: roleInfo.slug
    });

    if (loginType === 'frontend') {
      if (roleInfo.slug !== 'consumer') {
        Logger.log(`❌ Usuario ${user.email} intenta acceder al frontend con rol ${roleInfo.slug}, solo 'consumer' está permitido`);
        throw new Error('Solo los usuarios cliente pueden acceder a la aplicación móvil');
      }
    } else if (loginType === 'backoffice') {
      if (roleInfo.slug === 'consumer') {
        Logger.log(`❌ Usuario ${user.email} intenta acceder al backoffice con rol consumer`);
        throw new Error('Los usuarios cliente no pueden acceder al panel administrativo');
      }
    }
  }

  private async getRoleInfo(roleId: number): Promise<any> {
    try {
      if (!roleId) {
        Logger.error('⚠️ No se proporcionó role_id');
        return null;
      }
      
      Logger.log(`Buscando rol con ID: ${roleId}`);
      const role = await this.roleRepository.findById(roleId);
      
      if (!role) {
        Logger.error(`⚠️ Rol no encontrado con ID: ${roleId}`);
        return null;
      }
      
      Logger.log(`✅ Rol encontrado:`, {
        id: role.id,
        name: role.name,
        slug: role.slug
      });
      
      return role;
    } catch (error: any) {
      Logger.error(`Error al obtener información del rol (ID: ${roleId}):`, error);
      return null;
    }
  }
}
