import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IProduct } from '../../domain/entities/Product';
import ProductModel from '../database/models/ProductModel';
import { injectable } from 'tsyringe';

@injectable()
export class ProductRepository implements IProductRepository {
    async create(product: Partial<IProduct>): Promise<IProduct> {
        const newProduct = new ProductModel(product);
        return await newProduct.save();
    }

    async findAll(params: { skip: number; limit: number }): Promise<IProduct[]> {
        return await ProductModel.find()
            .skip(params.skip)
            .limit(params.limit)
            .sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<IProduct | null> {
        return await ProductModel.findById(id);
    }

    async findBySlug(slug: string): Promise<IProduct | null> {
        return await ProductModel.findOne({ slug });
    }

    async update(id: string, product: Partial<IProduct>): Promise<IProduct | null> {
        return await ProductModel.findByIdAndUpdate(id, product, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await ProductModel.findByIdAndDelete(id);
        return !!result;
    }

    async count(): Promise<number> {
        return await ProductModel.countDocuments();
    }
}