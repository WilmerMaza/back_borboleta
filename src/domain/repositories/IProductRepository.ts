import { IProduct } from '../entities/Product';

export interface IProductRepository {
  create(product: IProduct): Promise<IProduct>;
  findById(id: number): Promise<IProduct | null>;
  findAll(): Promise<IProduct[]>;
  update(id: number, product: Promise<IProduct>): Promise<IProduct | null>;
  delete(id: number): Promise<boolean>;
}