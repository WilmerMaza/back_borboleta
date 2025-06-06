import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { IProduct } from '../../../domain/entities/Product';
import { GetAllProductsQuery } from '../../queries/product/GetAllProductsQuery';

@injectable()
export class GetAllProductsHandler {
    constructor(
        @inject('ProductRepository') private readonly productRepository: IProductRepository
    ) {}

    async handle(_query: GetAllProductsQuery): Promise<IProduct[]> {
        return await this.productRepository.findAll({ skip: 0, limit: 10 });
    }
} 