import { IAddress } from '../../../domain/entities/Address';
import { ICommand } from '../../../domain/interfaces/ICommand';

export class UpdateAddressCommand implements ICommand {
  constructor(
    private readonly addressId: number,
    private readonly userId: number,
    private readonly addressData: Partial<Omit<IAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) {}

  get getAddressId(): number {
    return this.addressId;
  }

  get getUserId(): number {
    return this.userId;
  }

  get getAddressData(): Partial<Omit<IAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
    return this.addressData;
  }
}


