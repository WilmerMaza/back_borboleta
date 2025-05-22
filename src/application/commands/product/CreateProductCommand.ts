import { ICommand } from '../../../domain/interfaces/ICommand';
import { IProduct } from '../../../domain/entities/Product';

export class CreateProductCommand implements ICommand {
  constructor(private readonly productData: IProduct) {}

  get data(): IProduct {
    return this.productData;
  }
}
