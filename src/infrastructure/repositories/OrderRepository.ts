import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IOrder } from '../../domain/entities/Order';
import OrderModel from '../database/models/OrderModel';
import { injectable } from 'tsyringe';

@injectable()
export class OrderRepository implements IOrderRepository {
  async create(order: Partial<IOrder>): Promise<IOrder> {
    try {
      const newOrder = new OrderModel(order);
      const savedOrder = await newOrder.save();
      
      const orderObj = savedOrder.toObject();
      return {
        ...orderObj,
        id: orderObj._id
      };
    } catch (error) {
      console.error('❌ Error detallado en OrderRepository.create:', error);
      throw new Error(`Error al crear la orden en la base de datos: ${error.message}`);
    }
  }

  async findById(id: string): Promise<IOrder | null> {
    try {
      const order = await OrderModel.findById(id)
        .populate('user_id', 'name email')
        .populate('items.product_id', 'name price sale_price');
      
      if (!order) return null;
      
      const orderObj = order.toObject();
      return {
        ...orderObj,
        id: orderObj._id
      };
    } catch (error) {
      throw new Error('Error al obtener la orden de la base de datos');
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    try {
      const order = await OrderModel.findOne({ order_number: orderNumber })
        .populate('user_id', 'name email')
        .populate('items.product_id', 'name price sale_price');
      
      if (!order) return null;
      
      const orderObj = order.toObject();
      return {
        ...orderObj,
        id: orderObj._id
      };
    } catch (error) {
      throw new Error('Error al obtener la orden por número de la base de datos');
    }
  }

  async findByUserId(userId: string): Promise<IOrder[]> {
    try {
      const orders = await OrderModel.find({ user_id: userId })
        .populate('items.product_id', 'name price sale_price')
        .sort({ created_at: -1 });
      
      return orders.map(order => {
        const orderObj = order.toObject();
        return {
          ...orderObj,
          id: orderObj._id
        };
      });
    } catch (error) {
      throw new Error('Error al obtener las órdenes del usuario de la base de datos');
    }
  }

  async findByStoreId(storeId: number): Promise<IOrder[]> {
    try {
      const orders = await OrderModel.find({ store_id: storeId })
        .populate('user_id', 'name email')
        .populate('items.product_id', 'name price sale_price')
        .sort({ created_at: -1 });
      
      return orders.map(order => {
        const orderObj = order.toObject();
        return {
          ...orderObj,
          id: orderObj._id
        };
      });
    } catch (error) {
      throw new Error('Error al obtener las órdenes de la tienda de la base de datos');
    }
  }

  async findAll(params: { skip: number; limit: number }): Promise<IOrder[]> {
    try {
      const orders = await OrderModel.find()
        .populate('user_id', 'name email')
        .populate('items.product_id', 'name price sale_price')
        .skip(params.skip)
        .limit(params.limit)
        .sort({ created_at: -1 });
      
      return orders.map(order => {
        const orderObj = order.toObject();
        return {
          ...orderObj,
          id: orderObj._id
        };
      });
    } catch (error) {
      throw new Error('Error al obtener las órdenes de la base de datos');
    }
  }

  async update(id: string, order: Partial<IOrder>): Promise<IOrder | null> {
    try {
      const updatedOrder = await OrderModel.findByIdAndUpdate(id, order, { new: true })
        .populate('user_id', 'name email')
        .populate('items.product_id', 'name price sale_price');
      
      if (!updatedOrder) return null;
      
      const orderObj = updatedOrder.toObject();
      return {
        ...orderObj,
        id: orderObj._id
      };
    } catch (error) {
      console.error('❌ Error en OrderRepository.update:', error);
      throw new Error('Error al actualizar la orden en la base de datos');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await OrderModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('❌ Error en OrderRepository.delete:', error);
      throw new Error('Error al eliminar la orden de la base de datos');
    }
  }

  async count(): Promise<number> {
    try {
      const total = await OrderModel.countDocuments();
      return total;
    } catch (error) {
      throw new Error('Error al contar las órdenes en la base de datos');
    }
  }
} 