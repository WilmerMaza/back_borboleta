import { IProduct } from '../entities/Product';

export interface IProductRepository {
    create(product: Partial<IProduct>): Promise<IProduct>;
    findAll(params: { skip: number; limit: number; categoryId?: string }): Promise<IProduct[]>;
    findById(id: string): Promise<IProduct | null>;
    findByNumericId(numericId: number): Promise<IProduct | null>;
    findBySlug(slug: string): Promise<IProduct | null>;
    update(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
    updateByNumericId(id: number, product: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string): Promise<boolean>;
    deleteByNumericId(id: number): Promise<boolean>;
    count(params?: { categoryId?: string }): Promise<number>;
}