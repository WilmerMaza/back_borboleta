import { IAddress } from '../../../domain/entities/Address';
import { ICommand } from '../../../domain/interfaces/ICommand';

export class CreateAddressCommand implements ICommand {
  constructor(
    private readonly userId: number,
    private readonly addressData: Omit<IAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) {}

  get getUserId(): number {
    return this.userId;
  }

  get getAddressData(): Omit<IAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return this.addressData;
  }
}


