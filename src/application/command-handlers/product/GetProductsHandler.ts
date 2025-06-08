import { injectable, inject } from 'tsyringe';
import { GetProductsUseCase } from '../../usecases/product/GetProductsUseCase';
import { IProduct } from '../../../domain/entities/Product';

interface GetProductsParams {
    page?: number;
    limit?: number;
}

@injectable()
export class GetProductsHandler {
    constructor(
        @inject('GetProductsUseCase') private getProductsUseCase: GetProductsUseCase
    ) {}

    async handle(params?: GetProductsParams): Promise<{
        success: boolean;
        data: IProduct[];
        total: number;
        page: number;
        limit: number;
    }> {
        return await this.getProductsUseCase.execute(params);
    }
} 