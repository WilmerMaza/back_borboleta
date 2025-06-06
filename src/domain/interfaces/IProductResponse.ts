import { IProduct } from '../entities/Product';

export interface IProductResponse {
    data: IProduct[];
    total: number;
    limit: number;
    page: number;
} 