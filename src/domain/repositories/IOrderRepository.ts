import { IOrder } from '../entities/Order';

export interface IOrderRepository {
  create(order: Partial<IOrder>): Promise<IOrder>;
  findById(id: string): Promise<IOrder | null>;
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
  findByUserId(userId: string): Promise<IOrder[]>;
  findByStoreId(storeId: number): Promise<IOrder[]>;
  findAll(params: { skip: number; limit: number }): Promise<IOrder[]>;
  update(id: string, order: Partial<IOrder>): Promise<IOrder | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
} 