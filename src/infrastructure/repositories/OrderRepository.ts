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
    } catch (error: any) {
      console.error('Error al crear la orden:', error);
      throw new Error(`Error al crear la orden en la base de datos: ${error.message}`);
    }
  }

  async findById(id: string): Promise<IOrder | null> {
    try {
      // Validar que el ID sea un ObjectId válido de MongoDB
      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        // Si no es un ObjectId válido, intentar buscar por order_number
        return await this.findByOrderNumber(id);
      }

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
    } catch (error: any) {
      // Si es un error de formato de ID, simplemente devolver null
      if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId')) {
        return null;
      }
      console.error('Error en OrderRepository.findById:', error);
      // Devolver null en lugar de lanzar error para permitir búsquedas alternativas
      return null;
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
      console.error('Error en OrderRepository.update:', error);
      throw new Error('Error al actualizar la orden en la base de datos');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await OrderModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error en OrderRepository.delete:', error);
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

  /**
   * Busca una orden por la referencia de Wompi
   * Busca primero en payment_reference, luego en notes como fallback
   * @param reference - La referencia de Wompi
   * @returns La orden encontrada o null
   */
  async findOrderByReference(reference: string): Promise<IOrder | null> {
    try {
      // Primero buscar en payment_reference (más eficiente)
      let order = await OrderModel.findOne({
        payment_reference: reference
      })
        .populate('user_id', 'name email')
        .populate('items.product_id', 'name price sale_price');

      // Si no se encuentra, buscar en notes como fallback (compatibilidad con órdenes antiguas)
      if (!order) {
        order = await OrderModel.findOne({
          notes: { $regex: `\\[WOMPI_REFERENCE:${reference}\\]` }
        })
          .populate('user_id', 'name email')
          .populate('items.product_id', 'name price sale_price');
      }

      if (!order) return null;

      const orderObj = order.toObject();
      const createdAt = (order as any).createdAt;
      const updatedAt = (order as any).updatedAt;

      return {
        ...orderObj,
        id: orderObj._id,
        created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
        updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error en OrderRepository.findOrderByReference:', error);
      return null;
    }
  }

  /**
   * Busca la orden más reciente pendiente de un usuario con método de pago Wompi
   * Útil cuando el webhook llega pero no encuentra la referencia
   * @param userId - ID del usuario
   * @param minutesAgo - Buscar órdenes creadas en los últimos N minutos (default: 30)
   * @returns La orden encontrada o null
   */
  async findRecentPendingWompiOrder(userId: string, minutesAgo: number = 30): Promise<IOrder | null> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMinutes(cutoffDate.getMinutes() - minutesAgo);

      const order = await OrderModel.findOne({
        user_id: userId,
        payment_method: 'wompi',
        payment_status: 'pending',
        createdAt: { $gte: cutoffDate }
      })
        .sort({ createdAt: -1 }) // La más reciente primero
        .populate('user_id', 'name email')
        .populate('items.product_id', 'name price sale_price');

      if (!order) return null;

      const orderObj = order.toObject();
      const createdAt = (order as any).createdAt;
      const updatedAt = (order as any).updatedAt;

      return {
        ...orderObj,
        id: orderObj._id,
        created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
        updated_at: updatedAt ? updatedAt.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Error en OrderRepository.findRecentPendingWompiOrder:', error);
      return null;
    }
  }
} 