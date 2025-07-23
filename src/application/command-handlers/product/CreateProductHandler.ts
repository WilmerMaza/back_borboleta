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

    return await this.productRepository.create(command.data);
  }
}
