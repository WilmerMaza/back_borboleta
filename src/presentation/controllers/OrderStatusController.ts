import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IOrderStatusRepository, IOrderStatusActivityRepository } from '../../domain/repositories/IOrderStatusRepository';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

@injectable()
export class OrderStatusController {
  constructor(
    @inject('OrderStatusRepository') private orderStatusRepository: IOrderStatusRepository,
    @inject('OrderStatusActivityRepository') private orderStatusActivityRepository: IOrderStatusActivityRepository,
    @inject('OrderRepository') private orderRepository: IOrderRepository
  ) {}

  // GET /api/order-statuses
  async getAllOrderStatuses(_req: Request, res: Response): Promise<void> {
    try {
      const statuses = await this.orderStatusRepository.findAll();
      
      res.status(200).json({
        success: true,
        data: statuses
      });
    } catch (error: any) {
      console.error('Error al obtener estados de órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // PUT /api/orders/{id}/status
  async updateOrderStatus(_req: Request, res: Response): Promise<void> {
    try {
      const { id } = _req.params;
      const { order_status_id, note } = _req.body;

      if (!order_status_id) {
        res.status(400).json({
          success: false,
          message: 'order_status_id es requerido'
        });
        return;
      }

      const orderId = parseInt(id);
      const activity = await this.orderStatusActivityRepository.updateOrderStatus(
        orderId,
        order_status_id,
        note
      );

      res.status(200).json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: activity
      });
    } catch (error: any) {
      console.error('Error al actualizar estado de orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/orders/{id}/status-history
  async getOrderStatusHistory(_req: Request, res: Response): Promise<void> {
    try {
      const { id } = _req.params;
      const orderId = parseInt(id);

      const history = await this.orderStatusActivityRepository.findByOrderId(orderId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('Error al obtener historial de estados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/orders/status-counts
  async getOrderStatusCounts(_req: Request, res: Response): Promise<void> {
    try {
      const counts = await this.orderStatusRepository.getStatusCounts();

      res.status(200).json({
        success: true,
        data: counts
      });
    } catch (error: any) {
      console.error('Error al obtener conteos de estados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/orders/by-status/{status}
  async getOrdersByStatus(_req: Request, res: Response): Promise<void> {
    try {
      const { status } = _req.params;
      const page = parseInt(_req.query.page as string) || 1;
      const paginate = parseInt(_req.query.paginate as string) || 15;
    //   const search = _req.query.search as string || '';
    //   const sort = _req.query.sort as string || 'created_at';
    //   const sortDirection = _req.query.sort_direction as string || 'desc';

      // Implementación simplificada - en un caso real necesitarías consultas más específicas
      const skip = (page - 1) * paginate;
      const orders = await this.orderRepository.findAll({ skip, limit: paginate });

      // Filtrar por estado si es necesario
      const filteredOrders = status !== 'all' 
        ? orders.filter(order => order.status === status)
        : orders;

      // Simular datos de respuesta con la estructura esperada
      const formattedOrders = filteredOrders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        order_status: {
          id: 1,
          name: this.getStatusName(order.status || 'pending'),
          slug: order.status
        },
        total: order.total_amount,
        consumer: {
          name: order.customer_name || 'Cliente',
          email: order.customer_email || 'email@ejemplo.com'
        },
        created_at: order.created_at
      }));

      res.status(200).json({
        success: true,
        data: formattedOrders,
        total: formattedOrders.length,
        current_page: page,
        last_page: Math.ceil(filteredOrders.length / paginate),
        per_page: paginate
      });
    } catch (error: any) {
      console.error('Error al obtener órdenes por estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/orders/all
  async getAllOrders(_req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(_req.query.page as string) || 1;
      const paginate = parseInt(_req.query.paginate as string) || 15;
    //   const search = _req.query.search as string || '';
    //   const sort = _req.query.sort as string || 'created_at';
    //   const sortDirection = _req.query.sort_direction as string || 'desc';

      const skip = (page - 1) * paginate;
      const orders = await this.orderRepository.findAll({ skip, limit: paginate });

      // Formatear órdenes con la estructura esperada
      const formattedOrders = orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        order_status: {
          id: 1,
          name: this.getStatusName(order.status || 'pending'),
          slug: order.status
        },
        total: order.total_amount,
        consumer: {
          name: order.customer_name || 'Cliente',
          email: order.customer_email || 'email@ejemplo.com'
        },
        created_at: order.created_at
      }));

      res.status(200).json({
        success: true,
        data: formattedOrders,
        total: formattedOrders.length,
        current_page: page,
        last_page: Math.ceil(orders.length / paginate),
        per_page: paginate
      });
    } catch (error: any) {
      console.error('Error al obtener todas las órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  private getStatusName(status: string): string {
    const statusNames: { [key: string]: string } = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'En Proceso',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusNames[status] || 'Desconocido';
  }
}
