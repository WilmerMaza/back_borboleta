import { injectable, inject } from 'tsyringe';
import { IProduct } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';

@injectable()
export class CreateProductUseCase {
    constructor(
        @inject('ProductRepository') private readonly productRepository: IProductRepository
    ) {}

    async execute(productData: IProduct): Promise<IProduct> {
        // Validar datos requeridos
        if (!productData.name) {
            throw new Error('El nombre del producto es requerido');
        }
        if (!productData.price) {
            throw new Error('El precio del producto es requerido');
        }

        // Crear el producto
        const product = await this.productRepository.create(productData);
        return product;
    }
} 