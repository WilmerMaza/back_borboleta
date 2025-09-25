import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IProduct } from '../../../domain/entities/Product';

@injectable()
export class GetProductByIdHandler {
  constructor(
    @inject('ProductRepository') private productRepository: IProductRepository
  ) {}

  async handle(id: number): Promise<IProduct | null> {
    return await this.productRepository.findByNumericId(id);
  }
}