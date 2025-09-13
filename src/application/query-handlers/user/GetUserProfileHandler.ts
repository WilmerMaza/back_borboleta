import { injectable, inject } from 'tsyringe';
import { GetUserProfileQuery } from '../../queries/user/GetUserProfileQuery';
import { IUser } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class GetUserProfileHandler {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async handle(query: GetUserProfileQuery): Promise<IUser | null> {
    try {
      Logger.log('Obteniendo perfil del usuario:', query.getUserId);
      
      const user = await this.userRepository.findById(query.getUserId);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Remover la contraseña de la respuesta
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword as IUser;
    } catch (error: any) {
      Logger.error('Error en GetUserProfileHandler:', error);
      throw error;
    }
  }
}
