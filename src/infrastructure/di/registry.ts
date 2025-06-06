import { container } from 'tsyringe';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { CreateProductUseCase } from '../../application/usecases/product/CreateProductUseCase';
import { RegisterUserHandler } from '../../application/command-handlers/user/RegisterUserHandler';
import { UserRepository } from '../repositories/UserRepository';
import { GetProductsHandler } from '../../application/command-handlers/product/GetProductsHandler';
import { GetProductsUseCase } from '../../application/usecases/product/GetProductsUseCase';

// Registro de repositorios
container.register('ProductRepository', {
  useClass: ProductRepository
});

container.register('UserRepository', {
  useClass: UserRepository
});

// Registro de handlers
container.register('CreateProductHandler', {
  useClass: CreateProductHandler
});

container.register('GetProductsHandler', {
  useClass: GetProductsHandler
});

container.register('RegisterUserHandler', {
  useClass: RegisterUserHandler
});

// Registro de casos de uso
container.register('CreateProductUseCase', {
  useClass: CreateProductUseCase
});

container.register('GetProductsUseCase', {
  useClass: GetProductsUseCase
});

export { container };