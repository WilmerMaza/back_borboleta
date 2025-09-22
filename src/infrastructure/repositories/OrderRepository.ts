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
      
      // Debug: Log de la orden guardada
      console.log('🔍 Orden guardada en DB:', {
        _id: savedOrder._id,
        createdAt: (savedOrder as any).createdAt,
        updatedAt: (savedOrder as any).updatedAt,
        created_at: (savedOrder as any).created_at,
        updated_at: (savedOrder as any).updated_at,
        order_number: savedOrder.order_number,
        total_amount: savedOrder.total_amount
      });
      
      const orderObj = savedOrder.toObject();
      
      // Mongoose timestamps están en createdAt y updatedAt
      const createdAt = (savedOrder as any).createdAt;
      const updatedAt = (savedOrder as any).updatedAt;
      
      return {
        ...orderObj,
        id: orderObj._id,
        // Mapear timestamps de Mongoose a la interfaz
        created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
        updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
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
      
      // Mongoose timestamps están en createdAt y updatedAt
      const createdAt = (order as any).createdAt;
      const updatedAt = (order as any).updatedAt;
      
      return {
        ...orderObj,
        id: orderObj._id,
        // Mapear timestamps de Mongoose a la interfaz
        created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
        updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
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
      
      // Mongoose timestamps están en createdAt y updatedAt
      const createdAt = (order as any).createdAt;
      const updatedAt = (order as any).updatedAt;
      
      return {
        ...orderObj,
        id: orderObj._id,
        // Mapear timestamps de Mongoose a la interfaz
        created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
        updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Error al obtener la orden por número de la base de datos');
    }
  }

  async findByUserId(userId: string): Promise<IOrder[]> {
    try {
      const orders = await OrderModel.find({ user_id: userId })
        .populate('items.product_id', 'name price sale_price')
        .sort({ createdAt: -1 }); // Cambiar a createdAt que es el campo real de Mongoose
      
      return orders.map(order => {
        const orderObj = order.toObject();
        
        // Debug: Log de cada orden encontrada
        console.log('🔍 Orden encontrada en findByUserId:', {
          _id: order._id,
          createdAt: (order as any).createdAt,
          updatedAt: (order as any).updatedAt,
          order_number: order.order_number
        });
        
        // Mongoose timestamps están en createdAt y updatedAt
        const createdAt = (order as any).createdAt;
        const updatedAt = (order as any).updatedAt;
        
        return {
          ...orderObj,
          id: orderObj._id,
          // Mapear timestamps de Mongoose a la interfaz
          created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
          updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
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
        .sort({ createdAt: -1 }); // Cambiar a createdAt que es el campo real de Mongoose
      
      return orders.map(order => {
        const orderObj = order.toObject();
        
        // Mongoose timestamps están en createdAt y updatedAt
        const createdAt = (order as any).createdAt;
        const updatedAt = (order as any).updatedAt;
        
        return {
          ...orderObj,
          id: orderObj._id,
          // Mapear timestamps de Mongoose a la interfaz
          created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
          updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
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
        .sort({ createdAt: -1 }); // Cambiar a createdAt que es el campo real de Mongoose
      
      return orders.map(order => {
        const orderObj = order.toObject();
        
        // Mongoose timestamps están en createdAt y updatedAt
        const createdAt = (order as any).createdAt;
        const updatedAt = (order as any).updatedAt;
        
        return {
          ...orderObj,
          id: orderObj._id,
          // Mapear timestamps de Mongoose a la interfaz
          created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
          updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
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