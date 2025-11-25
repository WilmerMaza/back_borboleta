import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

import { AuthService } from '../../services/AuthService';
import { RegisterUserCommand } from '../../commands/user/RegisterUserCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class RegisterUserHandler {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("AuthService") private authService: AuthService
  ) {}

  async handle(command: RegisterUserCommand): Promise<any> {
    try {
      const userData = command.data;

      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );

      if (existingUser) {
        throw new Error("El email ya está registrado");
      }

      // Hash de la contraseña
      const hashedPassword = await this.authService.hashPassword(
        userData.password
      );

      // Crear usuario con rol "consumer" (cliente) por defecto
      const newUserData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        country_code: userData.country_code,
        role_id: 4, // ID del rol "consumer" (cliente)
        status: true,
        email_verified_at: undefined,
        is_approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const user = await this.userRepository.create(newUserData);

      Logger.log('✅ Usuario registrado exitosamente:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id
      });

      // Asegurarse de que el password nunca se devuelva (ya debería estar excluido por el modelo)
      const userResponse: any = { ...user };
      delete userResponse.password;

      return {
        ...userResponse,
        role_name: 'consumer',
        role_slug: 'consumer'
      };
    } catch (error: any) {
      throw error;
    }
  }
}
