import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import OrderModel from '../../infrastructure/database/models/OrderModel';
import UserModel from '../../infrastructure/database/models/UserModel';
import ProductModel from '../../infrastructure/database/models/ProductModel';

@injectable()
export class StatisticsController {
  // GET /api/statistics
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date, status, filter_by } = req.query;

      // Construir filtros de fecha
      let dateFilter: any = {};
      
      if (filter_by) {
        const now = new Date();
        switch (filter_by) {
          case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            dateFilter = {
              createdAt: {
                $gte: todayStart,
                $lte: todayEnd
              }
            };
            break;
          case 'last_week':
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: lastWeek } };
            break;
          case 'last_month':
            const lastMonth = new Date(now);
            lastMonth.setDate(now.getDate() - 30);
            dateFilter = { createdAt: { $gte: lastMonth } };
            break;
          case 'this_year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            dateFilter = { createdAt: { $gte: yearStart } };
            break;
          case 'all_time':
            dateFilter = {};
            break;
        }
      } else {
        // Usar fechas específicas si se proporcionan
        if (start_date || end_date) {
          dateFilter.createdAt = {};
          
          if (start_date) {
            const startDate = new Date(start_date as string);
            startDate.setHours(0, 0, 0, 0);
            dateFilter.createdAt.$gte = startDate;
          }
          
          if (end_date) {
            const endDate = new Date(end_date as string);
            endDate.setHours(23, 59, 59, 999);
            dateFilter.createdAt.$lte = endDate;
          }
        }
      }

      // Construir query base para órdenes
      const orderQuery: any = { ...dateFilter };
      
      // Agregar filtro por estado si se proporciona
      if (status) {
        orderQuery.status = status;
      }

      // Calcular todas las métricas en paralelo
      const [
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        uniqueStores,
        totalRefunds,
        pendingOrders,
        processingOrders,
        shippedOrders,
        outOfDeliveryOrders,
        cancelledOrders,
        deliveredOrders
      ] = await Promise.all([
        // total_revenue: Suma de total_amount de órdenes pagadas Y entregadas
        OrderModel.aggregate([
          { $match: { ...orderQuery, payment_status: 'paid', status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]).then(result => result[0]?.total || 0),

        // total_orders: Conteo total de órdenes
        OrderModel.countDocuments(orderQuery),

        // total_users: Conteo total de usuarios
        UserModel.countDocuments({}),

        // total_products: Conteo total de productos
        ProductModel.countDocuments({}),

        // total_stores: Conteo de store_id únicos en ProductModel
        ProductModel.distinct('store_id').then(stores => stores.filter((id: any) => id != null).length),

        // total_refunds: Conteo de órdenes con payment_status="refunded"
        OrderModel.countDocuments({ ...orderQuery, payment_status: 'refunded' }),

        // total_pending_orders
        OrderModel.countDocuments({ ...orderQuery, status: 'pending' }),

        // total_processing_orders
        OrderModel.countDocuments({ ...orderQuery, status: 'processing' }),

        // total_shipped_orders
        OrderModel.countDocuments({ ...orderQuery, status: 'shipped' }),

        // total_out_of_delivery_orders
        OrderModel.countDocuments({ ...orderQuery, status: 'out_for_delivery' }),

        // total_cancelled_orders
        OrderModel.countDocuments({ ...orderQuery, status: 'cancelled' }),

        // total_delivered_orders
        OrderModel.countDocuments({ ...orderQuery, status: 'delivered' })
      ]);

      // Construir respuesta
      const statistics = {
        total_revenue: Math.max(0, totalRevenue),
        total_orders: Math.max(0, totalOrders),
        total_users: Math.max(0, totalUsers),
        total_products: Math.max(0, totalProducts),
        total_stores: Math.max(0, uniqueStores),
        total_refunds: Math.max(0, totalRefunds),
        total_withdraw_requests: 0, // Hardcoded, no hay modelo
        total_pending_orders: Math.max(0, pendingOrders),
        total_processing_orders: Math.max(0, processingOrders),
        total_shipped_orders: Math.max(0, shippedOrders),
        total_out_of_delivery_orders: Math.max(0, outOfDeliveryOrders),
        total_cancelled_orders: Math.max(0, cancelledOrders),
        total_delivered_orders: Math.max(0, deliveredOrders)
      };

      res.status(200).json(statistics);
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

