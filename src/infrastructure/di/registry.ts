import { container } from 'tsyringe';
import { ProductRepository } from '../repositories/ProductRepository';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { RegisterUserHandler } from '../../application/command-handlers/user/RegisterUserHandler';
import { UserRepository } from '../repositories/UserRepository';
import { GetProductsHandler } from '../../application/command-handlers/product/GetProductsHandler';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductByIdHandler } from '../../application/query-handlers/product/GetProductByIdHandler';
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
import { CartRepository } from '../repositories/CartRepository';
import { CartController } from '../../presentation/controllers/CartController';
import { CheckoutService } from '../../application/services/CheckoutService';
import { CheckoutController } from '../../presentation/controllers/CheckoutController';

import { LoginHandler } from '../../application/command-handlers/user/LoginHandler';
import { AdminUserLoginHandler } from '../../application/command-handlers/admin/AdminUserLoginHandler';
import { CreateAdminUserHandler } from '../../application/command-handlers/admin/CreateAdminUserHandler';
import { UpdateAdminUserHandler } from '../../application/command-handlers/admin/UpdateAdminUserHandler';
import { DeleteAdminUserHandler } from '../../application/command-handlers/admin/DeleteAdminUserHandler';
import { GetAdminUserByIdHandler } from '../../application/query-handlers/admin/GetAdminUserByIdHandler';
import { GetAdminUsersHandler } from '../../application/query-handlers/admin/GetAdminUsersHandler';
import { LoginPhoneHandler } from '../../application/command-handlers/user/LoginPhoneHandler';
import { VerifyEmailOTPHandler } from '../../application/command-handlers/user/VerifyEmailOTPHandler';
import { VerifyPhoneOTPHandler } from '../../application/command-handlers/user/VerifyPhoneOTPHandler';
import { ForgotPasswordHandler } from '../../application/command-handlers/user/ForgotPasswordHandler';
import { UpdatePasswordHandler } from '../../application/command-handlers/user/UpdatePasswordHandler';
import { GetUserProfileHandler } from '../../application/query-handlers/user/GetUserProfileHandler';
import { AddressRepository } from '../repositories/AddressRepository';
import { CreateAddressHandler } from '../../application/command-handlers/address/CreateAddressHandler';
import { UpdateAddressHandler } from '../../application/command-handlers/address/UpdateAddressHandler';
import { DeleteAddressHandler } from '../../application/command-handlers/address/DeleteAddressHandler';
import { GetUserAddressesHandler } from '../../application/query-handlers/address/GetUserAddressesHandler';
import { AddressController } from '../../presentation/controllers/AddressController';
import { AuthService } from '../../application/services/AuthService';
import { OrderStatusRepository, OrderStatusActivityRepository } from '../repositories/OrderStatusRepository';
import { OrderStatusController } from '../../presentation/controllers/OrderStatusController';
import { AdminUserRepository } from '../repositories/AdminUserRepository';
import { AdminUserController } from '../../presentation/controllers/AdminUserController';
import { PermissionRepository } from '../repositories/PermissionRepository';
import { RoleRepository } from '../repositories/RoleRepository';
import { PermissionController } from '../../presentation/controllers/PermissionController';
import { RoleController } from '../../presentation/controllers/RoleController';
import { UserPermissionController } from '../../presentation/controllers/UserPermissionController';
import { AttachmentRepository } from '../repositories/AttachmentRepository';
import { AttachmentService } from '../../application/services/AttachmentService';

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

container.register('CartRepository', {
  useClass: CartRepository
});

container.register('AddressRepository', {
  useClass: AddressRepository
});

container.register('OrderStatusRepository', {
  useClass: OrderStatusRepository
});

container.register('OrderStatusActivityRepository', {
  useClass: OrderStatusActivityRepository
});

container.register('AdminUserRepository', {
  useClass: AdminUserRepository
});

container.register('PermissionRepository', {
  useClass: PermissionRepository
});

container.register('RoleRepository', {
  useClass: RoleRepository
});

container.register('IAttachmentRepository', {
  useClass: AttachmentRepository
});

container.register('CartController', {
  useClass: CartController
});

container.register('AddressController', {
  useClass: AddressController
});

container.register('CheckoutService', {
  useClass: CheckoutService
});

container.register('CheckoutController', {
  useClass: CheckoutController
});

container.register('AuthService', {
  useClass: AuthService
});

container.register('OrderStatusController', {
  useClass: OrderStatusController
});

container.register('AdminUserController', {
  useClass: AdminUserController
});

container.register('PermissionController', {
  useClass: PermissionController
});

container.register('RoleController', {
  useClass: RoleController
});

container.register('UserPermissionController', {
  useClass: UserPermissionController
});

container.register('AttachmentService', {
  useClass: AttachmentService
});

// Registro de handlers
container.register('CreateProductHandler', {
  useClass: CreateProductHandler
});

container.register('GetProductsHandler', {
  useClass: GetProductsHandler
});

container.register('GetProductByIdHandler', {
  useClass: GetProductByIdHandler
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

container.register('LoginHandler', {
  useClass: LoginHandler
});

container.register('AdminUserLoginHandler', {
  useClass: AdminUserLoginHandler
});

container.register('CreateAdminUserHandler', {
  useClass: CreateAdminUserHandler
});

container.register('UpdateAdminUserHandler', {
  useClass: UpdateAdminUserHandler
});

container.register('DeleteAdminUserHandler', {
  useClass: DeleteAdminUserHandler
});

container.register('GetAdminUserByIdHandler', {
  useClass: GetAdminUserByIdHandler
});

container.register('GetAdminUsersHandler', {
  useClass: GetAdminUsersHandler
});

container.register('LoginPhoneHandler', {
  useClass: LoginPhoneHandler
});

container.register('VerifyEmailOTPHandler', {
  useClass: VerifyEmailOTPHandler
});

container.register('VerifyPhoneOTPHandler', {
  useClass: VerifyPhoneOTPHandler
});

container.register('ForgotPasswordHandler', {
  useClass: ForgotPasswordHandler
});

container.register('UpdatePasswordHandler', {
  useClass: UpdatePasswordHandler
});

container.register('GetUserProfileHandler', {
  useClass: GetUserProfileHandler
});

container.register('CreateAddressHandler', {
  useClass: CreateAddressHandler
});

container.register('UpdateAddressHandler', {
  useClass: UpdateAddressHandler
});

container.register('DeleteAddressHandler', {
  useClass: DeleteAddressHandler
});

container.register('GetUserAddressesHandler', {
  useClass: GetUserAddressesHandler
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