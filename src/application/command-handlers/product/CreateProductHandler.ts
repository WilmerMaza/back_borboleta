import { injectable, inject } from 'tsyringe';
import { CreateProductCommand } from '../../commands/product/CreateProductCommand';
import { ProductRepository } from '../../../infrastructure/repositories/ProductRepository';
import { IProduct } from '../../../domain/entities/Product';

@injectable()
export class CreateProductHandler {
  constructor(
    @inject('ProductRepository') private productRepository: ProductRepository
  ) {}

  async handle(command: CreateProductCommand): Promise<IProduct> {
    const productData = command.data;
    console.log('📦 Datos recibidos en el handler:', productData);
    console.log('💰 Precio en el handler:', productData.price, 'Tipo:', typeof productData.price);

    return await this.productRepository.create(productData);
  }
}
