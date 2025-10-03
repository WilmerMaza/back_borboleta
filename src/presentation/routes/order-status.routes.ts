import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { OrderStatusController } from '../controllers/OrderStatusController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const orderStatusController = container.resolve(OrderStatusController);

// GET /api/order-statuses - Obtener todos los estados de órdenes
router.get('/order-statuses', authenticateToken, (req, res) => 
  orderStatusController.getAllOrderStatuses(req, res)
);

// GET /api/orders/status-counts - Obtener conteos de estados
router.get('/orders/status-counts', authenticateToken, (req, res) => 
  orderStatusController.getOrderStatusCounts(req, res)
);

// GET /api/orders/all - Obtener todas las órdenes
router.get('/orders/all', authenticateToken, (req, res) => 
  orderStatusController.getAllOrders(req, res)
);

// GET /api/orders/by-status/:status - Obtener órdenes por estado
router.get('/orders/by-status/:status', authenticateToken, (req, res) => 
  orderStatusController.getOrdersByStatus(req, res)
);

// PUT /api/orders/:id/status - Actualizar estado de orden
router.put('/orders/:id/status', authenticateToken, (req, res) => 
  orderStatusController.updateOrderStatus(req, res)
);

// GET /api/orders/:id/status-history - Obtener historial de estados de una orden
router.get('/orders/:id/status-history', authenticateToken, (req, res) => 
  orderStatusController.getOrderStatusHistory(req, res)
);

export default router;




