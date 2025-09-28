import { IQuery } from '../../../domain/interfaces/IQuery';
import { IAddressRepository } from '../../../domain/repositories/IAddressRepository';

export class GetUserAddressesQuery implements IQuery {
  constructor(
    private readonly userId: number,
    private readonly addressRepository: IAddressRepository
  ) {}

  get getUserId(): number {
    return this.userId;
  }

  get getRepository(): IAddressRepository {
    return this.addressRepository;
  }
}


