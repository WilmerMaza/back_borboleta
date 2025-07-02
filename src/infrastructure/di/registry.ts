import { container } from 'tsyringe';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { RegisterUserHandler } from '../../application/command-handlers/user/RegisterUserHandler';
import { UserRepository } from '../repositories/UserRepository';
import { GetProductsHandler } from '../../application/command-handlers/product/GetProductsHandler';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductBySlugHandler } from '../../application/command-handlers/product/GetProductBySlugHandler';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CreateCategoryUseCase } from '../../application/use-cases/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '../../application/use-cases/GetCategoriesUseCase';

// Registro de repositorios
container.register('ProductRepository', {
  useClass: ProductRepository
});

container.register('UserRepository', {
  useClass: UserRepository
});

container.register('CategoryRepository', {
  useClass: CategoryRepository
});

// Registro de handlers
container.register('CreateProductHandler', {
  useClass: CreateProductHandler
});

container.register('GetProductsHandler', {
  useClass: GetProductsHandler
});

container.register('GetProductBySlugHandler', {
  useClass: GetProductBySlugHandler
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

container.register('CreateCategoryUseCase', {
  useClass: CreateCategoryUseCase
});

container.register('GetCategoriesUseCase', {
  useClass: GetCategoriesUseCase
});

export { container };