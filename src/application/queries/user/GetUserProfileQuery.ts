import { IQuery } from '../../../domain/interfaces/IQuery';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class GetUserProfileQuery implements IQuery {
  constructor(
    private readonly userId: number,
    private readonly userRepository: IUserRepository
  ) {}

  get getUserId(): number {
    return this.userId;
  }

  get getRepository(): IUserRepository {
    return this.userRepository;
  }
}


