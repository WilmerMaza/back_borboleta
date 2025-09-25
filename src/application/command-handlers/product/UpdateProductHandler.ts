import { injectable, inject } from 'tsyringe';
import { UpdateProductCommand } from '../../commands/product/UpdateProductCommand';
import { ProductRepository } from '../../../infrastructure/repositories/ProductRepository';
import { IProduct } from '../../../domain/entities/Product';

@injectable()
export class UpdateProductHandler {
  constructor(
    @inject('ProductRepository') private productRepository: ProductRepository
  ) {}

  async handle(command: UpdateProductCommand): Promise<IProduct> {
    const { id, update } = command.data;
    
    // Verificar que el producto existe usando ID numérico
    const existingProduct = await this.productRepository.findByNumericId(id);
    if (!existingProduct) {
      throw new Error(`Producto con ID '${id}' no encontrado`);
    }

    // Validar precio si se está actualizando
    if (update.price !== undefined) {
      const price = Number(update.price);
      if (isNaN(price) || price < 0) {
        throw new Error('El precio debe ser un número válido mayor o igual a 0');
      }
      update.price = price;
    }

    // Actualizar usando el ID numérico
    const updatedProduct = await this.productRepository.updateByNumericId(id, update);
    
    if (!updatedProduct) {
      throw new Error('Error al actualizar el producto');
    }
    
    return updatedProduct;
  }
} 