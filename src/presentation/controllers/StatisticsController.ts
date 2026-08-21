import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import OrderModel from '../../infrastructure/database/models/OrderModel';
import UserModel from '../../infrastructure/database/models/UserModel';
import ProductModel from '../../infrastructure/database/models/ProductModel';
import {
  buildOrderDateFilter,
  getLast12MonthBuckets
} from '../utils/orderStatisticsDateFilter';

/** Ingreso cobrado: orden pagada y no cancelada (incluye en proceso, enviado, entregado, etc.). */
const PAID_NON_CANCELLED_REVENUE_MATCH = {
  payment_status: 'paid',
  status: { $nin: ['cancelled'] }
} as const;

@injectable()
export class StatisticsController {
  // GET /api/statistics
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;

      const dateFilter = buildOrderDateFilter(req.query);

      // Construir query base para órdenes
      const orderQuery: Record<string, unknown> = { ...dateFilter };

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
        // total_revenue: suma de total_amount de órdenes pagadas (excl. canceladas)
        OrderModel.aggregate([
          { $match: { ...orderQuery, ...PAID_NON_CANCELLED_REVENUE_MATCH } },
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

  /**
   * GET /api/statistics/revenue-chart
   * Ingresos y comisiones por mes (12 meses); mismos filtros de fecha que getStatistics.
   * Comisión por línea: items.total * (commission_rate de la primera categoría del producto / 100).
   * Criterio de ingreso: mismo que total_revenue (pagado y no cancelado).
   */
  async getRevenueChart(req: Request, res: Response): Promise<void> {
    try {
      const dateFilter = buildOrderDateFilter(req.query);
      const baseMatch: Record<string, unknown> = {
        ...dateFilter,
        ...PAID_NON_CANCELLED_REVENUE_MATCH
      };

      const anchor = this.resolveRevenueChartAnchor(req);
      const buckets = getLast12MonthBuckets(anchor);

      const [revenueRows, commissionRows] = await Promise.all([
        OrderModel.aggregate([
          { $match: baseMatch },
          {
            $group: {
              _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
              revenue: { $sum: '$total_amount' }
            }
          }
        ]),
        OrderModel.aggregate([
          { $match: baseMatch },
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              let: { pid: '$items.product_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$id', '$$pid'] } } },
                { $project: { categories: 1 } },
                { $limit: 1 }
              ],
              as: 'prodArr'
            }
          },
          { $set: { prod: { $arrayElemAt: ['$prodArr', 0] } } },
          {
            $set: {
              firstCatId: { $arrayElemAt: [{ $ifNull: ['$prod.categories', []] }, 0] }
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'firstCatId',
              foreignField: '_id',
              as: 'catArr'
            }
          },
          {
            $set: {
              cat: { $arrayElemAt: ['$catArr', 0] },
              lineCommission: {
                $multiply: [
                  { $ifNull: ['$items.total', 0] },
                  { $divide: [{ $ifNull: ['$cat.commission_rate', 0] }, 100] }
                ]
              }
            }
          },
          {
            $group: {
              _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
              commission: { $sum: '$lineCommission' }
            }
          }
        ])
      ]);

      const revenueMap = new Map<string, number>();
      for (const row of revenueRows as { _id: { y: number; m: number }; revenue: number }[]) {
        const k = `${row._id.y}-${String(row._id.m).padStart(2, '0')}`;
        revenueMap.set(k, row.revenue);
      }

      const commissionMap = new Map<string, number>();
      for (const row of commissionRows as { _id: { y: number; m: number }; commission: number }[]) {
        const k = `${row._id.y}-${String(row._id.m).padStart(2, '0')}`;
        commissionMap.set(k, row.commission);
      }

      const months: string[] = [];
      const revenues: number[] = [];
      const commissions: number[] = [];

      for (const b of buckets) {
        months.push(b.label);
        revenues.push(Math.max(0, revenueMap.get(b.key) ?? 0));
        commissions.push(Math.max(0, commissionMap.get(b.key) ?? 0));
      }

      res.status(200).json({ months, revenues, commissions });
    } catch (error: any) {
      console.error('Error al obtener revenue chart:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  private resolveRevenueChartAnchor(req: Request): Date {
    const { end_date, filter_by } = req.query;
    if (end_date) {
      const d = new Date(end_date as string);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    if (filter_by === 'today') {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    return new Date();
  }
}
