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

  async updateOrderStatus(orderId: string | number, statusId: number, note?: string): Promise<IOrderStatusActivity> {
    try {
      console.log('🔍 [updateOrderStatus] Buscando estado con ID:', statusId);
      
      // Obtener información del estado
      // Primero intentar buscar por id
      let statusDoc = await OrderStatusModel.findOne({ id: statusId });
      
      // Si no se encuentra, listar todos los estados disponibles para debug
      if (!statusDoc) {
        const allStatuses = await OrderStatusModel.find({});
        console.log('📋 ===== ESTADOS DISPONIBLES EN LA BASE DE DATOS =====');
        if (allStatuses.length === 0) {
          console.log('⚠️ NO HAY ESTADOS EN LA BASE DE DATOS');
        } else {
          allStatuses.forEach((s: any) => {
            const sObj = (s as any).toObject ? (s as any).toObject() : s;
            console.log(`  - ID: ${sObj.id || 'N/A'}, Slug: ${sObj.slug || 'N/A'}, Nombre: ${sObj.name || 'N/A'}, Activo: ${sObj.status}, Eliminado: ${sObj.deleted_at ? 'Sí' : 'No'}`);
          });
        }
        console.log('===================================================');
        
        // Intentar buscar por slug común basado en el ID
        // Mapeo común: 1=pending, 2=confirmed, 3=processing, 4=shipped, 5=delivered, 6=cancelled
        const statusSlugMap: { [key: number]: string } = {
          1: 'pending',
          2: 'confirmed',
          3: 'processing',
          4: 'shipped',
          5: 'delivered',
          6: 'cancelled'
        };
        
        const slug = statusSlugMap[statusId];
        if (slug) {
          console.log(`🔄 Intentando buscar por slug: ${slug}`);
          statusDoc = await OrderStatusModel.findOne({ slug: slug });
        }
      }
      
      if (!statusDoc) {
        const errorMsg = `Estado de orden no encontrado con ID: ${statusId}. Verifique que el estado exista en la base de datos.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      // Convertir el documento de Mongoose a objeto plano
      const status = (statusDoc as any).toObject ? (statusDoc as any).toObject() : statusDoc;
      console.log('✅ Estado encontrado:', { id: status.id, slug: status.slug, name: status.name });

      // Determinar cómo buscar la orden: por _id (ObjectId) o por order_number
      let orderQuery: any;
      if (typeof orderId === 'string' && orderId.match(/^[0-9a-fA-F]{24}$/)) {
        // Es un ObjectId válido de MongoDB
        const mongoose = require('mongoose');
        orderQuery = { _id: new mongoose.Types.ObjectId(orderId) };
      } else {
        // Es un número o string numérico, buscar por order_number
        orderQuery = { order_number: orderId.toString() };
      }

      // Buscar la orden para verificar que existe y obtener el order_number
      const order = await OrderModel.findOne(orderQuery);
      if (!order) {
        throw new Error(`Orden no encontrada con ID: ${orderId}`);
      }

      // Obtener el order_number para la actividad (necesario para order_id numérico)
      const orderObj = (order as any).toObject ? (order as any).toObject() : order;
      const activityOrderId = orderObj.order_number ? parseInt(orderObj.order_number) : 0;

      // Crear nueva actividad
      const activity = new OrderStatusActivityModel({
        order_id: activityOrderId,
        order_status_id: statusId,
        status: status.slug,
        status_name: status.name,
        note: note || '',
        changed_at: new Date()
      });

      const savedActivity = await (activity as any).save();

      // Actualizar el estado de la orden usando el query correcto
      await OrderModel.findOneAndUpdate(
        orderQuery,
        { status: status.slug },
        { new: true }
      );

      const activityObj = (savedActivity as any).toObject();
      return {
        ...activityObj,
        id: activityObj.id,
        created_at: (savedActivity as any).createdAt?.toISOString(),
        updated_at: (savedActivity as any).updatedAt?.toISOString()
      };
    } catch (error: any) {
      console.error('Error en updateOrderStatus:', error);
      throw new Error(`Error al actualizar el estado de la orden: ${error.message}`);
    }
  }
}
