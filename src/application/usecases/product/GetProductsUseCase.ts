import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IProduct } from '../../../domain/entities/Product';
import { injectable, inject } from 'tsyringe';

interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@injectable()
export class GetProductsUseCase {
    constructor(
        @inject('ProductRepository') private productRepository: IProductRepository
    ) {}

    async execute(params?: GetProductsParams): Promise<{
        success: boolean;
        data: IProduct[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;

            const [products, total] = await Promise.all([
                this.productRepository.findAll({ skip, limit }),
                this.productRepository.count()
            ]);

            return {
                success: true,
                data: products,
                total,
                page,
                limit
            };
        } catch (error) {
            throw new Error('Error al obtener los productos');
        }
    }
} 