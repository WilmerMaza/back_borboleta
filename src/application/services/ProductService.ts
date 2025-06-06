import { injectable, inject } from 'tsyringe';
import { IProduct } from '../../domain/entities/Product';
import { CreateProductHandler } from '../command-handlers/product/CreateProductHandler';
import { CreateProductCommand } from '../commands/product/CreateProductCommand';

@injectable()
export class ProductService {
  constructor(
    @inject('CreateProductHandler') private readonly createHandler: CreateProductHandler
  ) {}

  async createProduct(productData: IProduct): Promise<IProduct> {
    const command = new CreateProductCommand(productData);
    return await this.createHandler.handle(command);
  }
}
