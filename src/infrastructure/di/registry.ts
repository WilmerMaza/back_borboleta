import { container } from 'tsyringe';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { RegisterUserHandler } from '../../application/command-handlers/user/RegisterUserHandler';
import { UserRepository } from '../repositories/UserRepository';
import { GetProductsHandler } from '../../application/command-handlers/product/GetProductsHandler';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductBySlugHandler } from '../../application/command-handlers/product/GetProductBySlugHandler';
import { UpdateProductHandler } from '../../application/command-handlers/product/UpdateProductHandler';
import { DeleteProductHandler } from '../../application/command-handlers/product/DeleteProductHandler';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CreateCategoryUseCase } from '../../application/use-cases/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '../../application/use-cases/GetCategoriesUseCase';
import { UpdateCategoryHandler } from '../../application/command-handlers/category/UpdateCategoryHandler';
import { DeleteCategoryHandler } from '../../application/command-handlers/category/DeleteCategoryHandler';
import { OrderRepository } from '../repositories/OrderRepository';
import { CreateOrderHandler } from '../../application/command-handlers/order/CreateOrderHandler';

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

container.register('OrderRepository', {
  useClass: OrderRepository
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

container.register('UpdateProductHandler', {
  useClass: UpdateProductHandler
});

container.register('DeleteProductHandler', {
  useClass: DeleteProductHandler
});

container.register('UpdateCategoryHandler', {
  useClass: UpdateCategoryHandler
});

container.register('DeleteCategoryHandler', {
  useClass: DeleteCategoryHandler
});

container.register('CreateOrderHandler', {
  useClass: CreateOrderHandler
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