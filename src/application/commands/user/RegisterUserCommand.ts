import { IUser } from 'src/domain/entities/User';
import { ICommand } from '../../../domain/interfaces/ICommand';


export class RegisterUserCommand implements ICommand {
  constructor(private readonly userData: IUser) {}

  get data(): IUser {
    return this.userData;
  }
}