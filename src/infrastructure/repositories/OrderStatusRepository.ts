import { injectable } from 'tsyringe';
import { IOrderStatusRepository, IOrderStatusActivityRepository } from '../../domain/repositories/IOrderStatusRepository';
import { IOrderStatus, IOrderStatusActivity, IOrderStatusCounts } from '../../domain/entities/OrderStatus';
import OrderStatusModel from '../database/models/OrderStatusModel';
import OrderStatusActivityModel from '../database/models/OrderStatusActivityModel';
import OrderModel from '../database/models/OrderModel';

@injectable()
export class OrderStatusRepository implements IOrderStatusRepository {
  async findAll(): Promise<IOrderStatus[]> {
    try {
      const statuses = await OrderStatusModel.find({ 
        status: true,
        deleted_at: null 
      }).sort({ sequence: 1 });
      
      return statuses.map(status => {
        const statusObj = (status as any).toObject();
        return {
          ...statusObj,
          id: statusObj.id,
          deleted_at: statusObj.deleted_at?.toISOString(),
          created_at: (status as any).createdAt?.toISOString(),
          updated_at: (status as any).updatedAt?.toISOString()
        };
      });
    } catch (error) {
      throw new Error('Error al obtener los estados de órdenes');
    }
  }

  async findById(id: number): Promise<IOrderStatus | null> {
    try {
      const status = await OrderStatusModel.findOne({ 
        id, 
        status: true,
        deleted_at: null 
      });
      if (!status) return null;
      
      const statusObj = (status as any).toObject();
      return {
        ...statusObj,
        id: statusObj.id,
        deleted_at: statusObj.deleted_at?.toISOString(),
        created_at: (status as any).createdAt?.toISOString(),
        updated_at: (status as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al obtener el estado de orden');
    }
  }

  async findBySlug(slug: string): Promise<IOrderStatus | null> {
    try {
      const status = await OrderStatusModel.findOne({ 
        slug, 
        status: true,
        deleted_at: null 
      });
      if (!status) return null;
      
      const statusObj = (status as any).toObject();
      return {
        ...statusObj,
        id: statusObj.id,
        deleted_at: statusObj.deleted_at?.toISOString(),
        created_at: (status as any).createdAt?.toISOString(),
        updated_at: (status as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al obtener el estado de orden por slug');
    }
  }

  async create(orderStatus: Partial<IOrderStatus>): Promise<IOrderStatus> {
    try {
      const newStatus = new OrderStatusModel(orderStatus);
      const savedStatus = await (newStatus as any).save();
      
      const statusObj = (savedStatus as any).toObject();
      return {
        ...statusObj,
        id: statusObj.id,
        deleted_at: statusObj.deleted_at?.toISOString(),
        created_at: (savedStatus as any).createdAt?.toISOString(),
        updated_at: (savedStatus as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al crear el estado de orden');
    }
  }

  async update(id: number, orderStatus: Partial<IOrderStatus>): Promise<IOrderStatus | null> {
    try {
      const updatedStatus = await OrderStatusModel.findOneAndUpdate(
        { id, deleted_at: null },
        orderStatus,
        { new: true }
      );
      
      if (!updatedStatus) return null;
      
      const statusObj = (updatedStatus as any).toObject();
      return {
        ...statusObj,
        id: statusObj.id,
        deleted_at: statusObj.deleted_at?.toISOString(),
        created_at: (updatedStatus as any).createdAt?.toISOString(),
        updated_at: (updatedStatus as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al actualizar el estado de orden');
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await OrderStatusModel.findOneAndUpdate(
        { id, deleted_at: null },
        { 
          status: false,
          deleted_at: new Date()
        },
        { new: true }
      );
      return !!result;
    } catch (error) {
      throw new Error('Error al eliminar el estado de orden');
    }
  }

  async getStatusCounts(): Promise<IOrderStatusCounts> {
    try {
      const counts = await OrderModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusCounts: IOrderStatusCounts = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        total: 0
      };

      counts.forEach(count => {
        const status = count._id || 'pending';
        if (status in statusCounts) {
          (statusCounts as any)[status] = count.count;
        }
        statusCounts.total += count.count;
      });

      return statusCounts;
    } catch (error) {
      throw new Error('Error al obtener conteos de estados');
    }
  }
}

@injectable()
export class OrderStatusActivityRepository implements IOrderStatusActivityRepository {
  async create(activity: Partial<IOrderStatusActivity>): Promise<IOrderStatusActivity> {
    try {
      const newActivity = new OrderStatusActivityModel(activity);
      const savedActivity = await (newActivity as any).save();
      
      const activityObj = (savedActivity as any).toObject();
      return {
        ...activityObj,
        id: activityObj.id,
        created_at: (savedActivity as any).createdAt?.toISOString(),
        updated_at: (savedActivity as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al crear la actividad de estado');
    }
  }

  async findByOrderId(orderId: number): Promise<IOrderStatusActivity[]> {
    try {
      const activities = await OrderStatusActivityModel.find({ order_id: orderId })
        .sort({ created_at: 1 });
      
      return activities.map(activity => {
        const activityObj = (activity as any).toObject();
        return {
          ...activityObj,
          id: activityObj.id,
          created_at: (activity as any).createdAt?.toISOString(),
          updated_at: (activity as any).updatedAt?.toISOString()
        };
      });
    } catch (error) {
      throw new Error('Error al obtener el historial de estados');
    }
  }

  async updateOrderStatus(orderId: number, statusId: number, note?: string): Promise<IOrderStatusActivity> {
    try {
      // Obtener información del estado
      const OrderStatusModel = require('../database/models/OrderStatusModel').default;
      const status = await OrderStatusModel.findOne({ id: statusId });
      
      if (!status) {
        throw new Error('Estado de orden no encontrado');
      }

      // Crear nueva actividad
      const activity = new OrderStatusActivityModel({
        order_id: orderId,
        order_status_id: statusId,
        status: status.slug,
        status_name: status.name,
        note: note || '',
        changed_at: new Date()
      });

      const savedActivity = await (activity as any).save();

      // Actualizar el estado de la orden
      await OrderModel.findOneAndUpdate(
        { id: orderId },
        { status: status.slug }
      );

      const activityObj = (savedActivity as any).toObject();
      return {
        ...activityObj,
        id: activityObj.id,
        created_at: (savedActivity as any).createdAt?.toISOString(),
        updated_at: (savedActivity as any).updatedAt?.toISOString()
      };
    } catch (error) {
      throw new Error('Error al actualizar el estado de la orden');
    }
  }
}
