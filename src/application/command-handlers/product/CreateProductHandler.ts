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

    // Si quieres permitir productos incluso sin nombre o precio, elimina esta validación:
    // También puedes loguear si te interesa saber qué viene vacío
    // console.log('Creando producto con datos:', productData);

    return await this.productRepository.create(productData);
  }
}
