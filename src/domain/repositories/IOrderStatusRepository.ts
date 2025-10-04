import { IOrderStatus, IOrderStatusActivity, IOrderStatusCounts } from '../entities/OrderStatus';

export interface IOrderStatusRepository {
  findAll(): Promise<IOrderStatus[]>;
  findById(id: number): Promise<IOrderStatus | null>;
  findBySlug(slug: string): Promise<IOrderStatus | null>;
  create(orderStatus: Partial<IOrderStatus>): Promise<IOrderStatus>;
  update(id: number, orderStatus: Partial<IOrderStatus>): Promise<IOrderStatus | null>;
  delete(id: number): Promise<boolean>;
  getStatusCounts(): Promise<IOrderStatusCounts>;
}

export interface IOrderStatusActivityRepository {
  create(activity: Partial<IOrderStatusActivity>): Promise<IOrderStatusActivity>;
  findByOrderId(orderId: number): Promise<IOrderStatusActivity[]>;
  updateOrderStatus(orderId: number, statusId: number, note?: string): Promise<IOrderStatusActivity>;
}




