import { injectable, inject } from 'tsyringe';
import { RegisterUserCommand } from '../../commands/user/RegisterUserCommand';

import { Logger } from '../../../shared/utils/logger';
import { IUserRepository } from 'src/domain/repositories/IUserRepository';
import { IUser } from 'src/domain/entities/User';

@injectable()
export class RegisterUserHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async handle(command: RegisterUserCommand): Promise<IUser> {
    const userData = command.data;
    
    // Verificar si el correo ya existe
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    Logger.log('Registrando nuevo usuario', userData.email);
    
    // Valores por defecto para nuevos usuarios
    const defaultUserData: IUser = {
      ...userData,
      status: userData.status ?? true,
      is_approved: userData.is_approved ?? false,
    };
    
    return await this.userRepository.create(defaultUserData);
  }
}