import { IProduct } from '../entities/Product';

export interface IProductRepository {
    create(product: Partial<IProduct>): Promise<IProduct>;
    findAll(params: { skip: number; limit: number }): Promise<IProduct[]>;
    findById(id: string): Promise<IProduct | null>;
    findBySlug(slug: string): Promise<IProduct | null>;
    update(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string): Promise<boolean>;
    count(): Promise<number>;
}