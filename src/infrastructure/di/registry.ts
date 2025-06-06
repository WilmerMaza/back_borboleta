import { container } from 'tsyringe';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { CreateProductUseCase } from '../../application/usecases/product/CreateProductUseCase';
import { RegisterUserHandler } from '../../application/command-handlers/user/RegisterUserHandler';
import { UserRepository } from '../repositories/UserRepository';

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

container.register('RegisterUserHandler', {
  useClass: RegisterUserHandler
});

// Registro de casos de uso
container.register('CreateProductUseCase', {
  useClass: CreateProductUseCase
});

export { container };