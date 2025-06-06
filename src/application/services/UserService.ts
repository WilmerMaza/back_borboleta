import { injectable, inject } from 'tsyringe';

import { RegisterUserHandler } from '../command-handlers/user/RegisterUserHandler';
import { RegisterUserCommand } from '../commands/user/RegisterUserCommand';
import { IUser } from 'src/domain/entities/User';

@injectable()
export class UserService {
  constructor(
    @inject('RegisterUserHandler') private readonly registerHandler: RegisterUserHandler
  ) {}

  async registerUser(userData: IUser): Promise<IUser> {
    const command = new RegisterUserCommand(userData);
    return await this.registerHandler.handle(command);
  }

  // Aquí puedes agregar más métodos como:
  // - loginUser
  // - getUserProfile
  // - updateUserProfile
  // - etc.
}