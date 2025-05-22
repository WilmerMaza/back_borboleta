
import { injectable } from 'tsyringe';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IProduct } from '../../domain/entities/Product';
import ProductModel from '../database/models/ProductModel';

@injectable()
export class ProductRepository implements IProductRepository {
  async create(product: IProduct): Promise<IProduct> {
    return await ProductModel.create(product);
  }

  async findAll(): Promise<IProduct[]> {
    return await ProductModel.find();
  }

  async findById(id: number): Promise<IProduct | null> {
    return await ProductModel.findById(id);
  }

  async update(id: number, product: Promise<IProduct>): Promise<IProduct | null> {
    return await ProductModel.findByIdAndUpdate(id, product, { new: true });
  }

  async delete(id: number): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return result !== null;
  }
}