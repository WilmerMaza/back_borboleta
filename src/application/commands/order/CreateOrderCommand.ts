import { ICommand } from '../../../domain/interfaces/ICommand';
import { IOrder } from '../../../domain/entities/Order';

export class CreateOrderCommand implements ICommand {
  constructor(private readonly orderData: IOrder) {}

  get data(): IOrder {
    return this.orderData;
  }
} 