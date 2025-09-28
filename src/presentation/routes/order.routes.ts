import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { OrderController } from '../controllers/OrderController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const orderController = container.resolve(OrderController);

// POST /api/orders - Crear nueva orden (requiere autenticación)
router.post('/', authenticateToken, (req, res) => orderController.createOrder(req, res));

// GET /api/orders - Obtener órdenes del usuario autenticado
router.get('/', authenticateToken, (req, res) => orderController.getUserOrders(req, res));

// GET /api/orders/:id - Obtener orden por ID (requiere autenticación)
router.get('/:id', authenticateToken, (req, res) => orderController.getOrderById(req, res));

// GET /api/orders/number/:orderNumber - Obtener orden por número (requiere autenticación)
router.get('/number/:orderNumber', authenticateToken, (req, res) => orderController.getOrderByOrderNumber(req, res));

export default router; 