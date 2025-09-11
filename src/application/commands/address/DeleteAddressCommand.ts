import { ICommand } from '../../../domain/interfaces/ICommand';

export class DeleteAddressCommand implements ICommand {
  constructor(
    private readonly addressId: number,
    private readonly userId: number
  ) {}

  get getAddressId(): number {
    return this.addressId;
  }

  get getUserId(): number {
    return this.userId;
  }
}


