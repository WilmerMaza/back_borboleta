import { injectable, inject } from 'tsyringe';
import { IProduct } from '../../domain/entities/Product';
import { CreateProductHandler } from '../command-handlers/product/CreateProductHandler';
import { CreateProductCommand } from '../commands/product/CreateProductCommand';

@injectable()
export class ProductService {
  constructor(
    @inject('CreateProductHandler') private readonly createHandler: CreateProductHandler
  ) {}

  async createProduct(productData: IProduct): Promise<IProduct> {
    const command = new CreateProductCommand(productData);
    return await this.createHandler.handle(command);
  }

  // async getAllProducts(): Promise<IProduct[]> {
  //   const query = new GetAllProductsQuery();
  //   const handler = new GetAllProductsHandler(this.productRepository);
  //   return await handler.handle(query);
  // }

  // async getProductById(id: number): Promise<IProduct | null> {
  //   const query = new GetProductByIdQuery(id);
  //   const handler = new GetProductByIdHandler(this.productRepository);
  //   return await handler.handle(query);
  // }

  // async updateProduct(id: number, productData: Partial<IProduct>): Promise<IProduct | null> {
  //   const command = new UpdateProductCommand(id, productData);
  //   const handler = new UpdateProductHandler(this.productRepository);
  //   return await handler.handle(command);
  // }
}