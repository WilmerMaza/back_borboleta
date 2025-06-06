import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IProduct } from '../../../domain/entities/Product';
import { injectable, inject } from 'tsyringe';

export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@injectable()
export class GetProductsUseCase {
    constructor(
        @inject('ProductRepository') private readonly productRepository: IProductRepository
    ) {}

    async execute(params: GetProductsParams = {}): Promise<{
        success: boolean;
        data: IProduct[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const {
                page = 1,
                limit = 10,
            
            } = params;

            const skip = (page - 1) * limit;

            const [products, total] = await Promise.all([
                this.productRepository.findAll({
                    skip,
                    limit
                }),
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
            return {
                success: false,
                data: [],
                total: 0,
                page: 1,
                limit: 10
            };
        }
    }
} 