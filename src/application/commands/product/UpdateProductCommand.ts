import { ICommand } from '../../../domain/interfaces/ICommand';
import { IProduct } from '../../../domain/entities/Product';

export class UpdateProductCommand implements ICommand {
  constructor(
    private readonly id: number,
    private readonly productData: Partial<IProduct>
  ) {}

  get data(): { id: number; update: Partial<IProduct> } {
    return { id: this.id, update: this.productData };
  }
}