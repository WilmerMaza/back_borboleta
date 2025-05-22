import { container } from 'tsyringe';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { GetProductByIdHandler } from '../../application/query-handlers/product/GetProductByIdHandler';

container.register('ProductRepository', {
  useClass: ProductRepository
});

container.register('CreateProductHandler', {
  useClass: CreateProductHandler
});

container.register('GetProductByIdHandler', {
  useClass: GetProductByIdHandler
});