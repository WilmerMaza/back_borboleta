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
    try {
      const { id, update } = command.data;
      
      console.log("🔄 UpdateProductHandler - Iniciando actualización:", { id, update });
      
      // Verificar que el producto existe usando ID numérico
      const existingProduct = await this.productRepository.findByNumericId(id);
      if (!existingProduct) {
        throw new Error(`Producto con ID '${id}' no encontrado`);
      }

      console.log("✅ Producto encontrado:", existingProduct.id);

      // Validar precio si se está actualizando
      if (update.price !== undefined) {
        const price = Number(update.price);
        if (isNaN(price) || price < 0) {
          throw new Error('El precio debe ser un número válido mayor o igual a 0');
        }
        update.price = price;
      }

      // Validar otros campos numéricos
      if (update.discount !== undefined) {
        const discount = Number(update.discount);
        if (!isNaN(discount) && (discount < 0 || discount > 100)) {
          throw new Error('El descuento debe estar entre 0 y 100');
        }
        update.discount = discount;
      }

      console.log("📝 Datos validados, procediendo con actualización...");

      // Actualizar usando el ID numérico
      const updatedProduct = await this.productRepository.updateByNumericId(id, update);
      
      if (!updatedProduct) {
        throw new Error('Error al actualizar el producto');
      }
      
      console.log("✅ Producto actualizado exitosamente:", updatedProduct.id);
      return updatedProduct;
    } catch (error) {
      console.error("❌ Error en UpdateProductHandler:", error);
      throw error;
    }
  }
} 