import { injectable, inject } from 'tsyringe';
import { DeleteProductCommand } from '../../commands/product/DeleteProductCommand';
import { ProductRepository } from '../../../infrastructure/repositories/ProductRepository';

@injectable()
export class DeleteProductHandler {
  constructor(
    @inject('ProductRepository') private productRepository: ProductRepository
  ) {}

  async handle(command: DeleteProductCommand): Promise<boolean> {
    const { id } = command.data;
    
    // Verificar que el producto existe usando ID numérico
    const existingProduct = await this.productRepository.findByNumericId(id);
    if (!existingProduct) {
      throw new Error(`Producto con ID '${id}' no encontrado`);
    }

    // Eliminar usando el ID numérico
    const deleted = await this.productRepository.deleteByNumericId(id);
    
    if (!deleted) {
      throw new Error('Error al eliminar el producto');
    }
    
    return deleted;
  }
} 