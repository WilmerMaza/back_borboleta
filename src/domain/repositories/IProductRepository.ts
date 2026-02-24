import { IProduct } from '../entities/Product';

export interface ProductIncludeOptions {
    include?: string[];
}

export interface IProductRepository {
    create(product: Partial<IProduct>): Promise<IProduct>;
    findAll(params: { skip: number; limit: number; categoryId?: string }): Promise<IProduct[]>;
    findAllWithDiscount(params: { skip: number; limit: number }): Promise<IProduct[]>;
    countWithDiscount(): Promise<number>;
    findById(id: string): Promise<IProduct | null>;
    findByNumericId(numericId: number, options?: ProductIncludeOptions): Promise<IProduct | null>;
    findBySlug(slug: string, options?: ProductIncludeOptions): Promise<IProduct | null>;
    update(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
    updateByNumericId(id: number, product: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string): Promise<boolean>;
    deleteByNumericId(id: number): Promise<boolean>;
    count(params?: { categoryId?: string }): Promise<number>;
}