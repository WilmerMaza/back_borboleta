import { injectable, inject } from 'tsyringe';
import { GetProductBySlugCommand } from '../../commands/product/GetProductBySlugCommand';
import { ProductRepository } from '../../../infrastructure/repositories/ProductRepository';
import { IProduct } from '../../../domain/entities/Product';
import { ProductIncludeOptions } from '../../../domain/repositories/IProductRepository';

@injectable()
export class GetProductBySlugHandler {
  constructor(
    @inject('ProductRepository') private productRepository: ProductRepository
  ) {}

  async handle(command: GetProductBySlugCommand, options?: ProductIncludeOptions): Promise<IProduct> {
    const { slug } = command.data;
    
    const product = await this.productRepository.findBySlug(slug, options);
    
    if (!product) {
      throw new Error(`Producto con slug '${slug}' no encontrado`);
    }
    
    return product;
  }
} 