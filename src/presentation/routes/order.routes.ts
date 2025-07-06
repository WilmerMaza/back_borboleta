import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { OrderController } from '../controllers/OrderController';

const router = Router();
const orderController = container.resolve(OrderController);

// POST /api/orders - Crear nueva orden
router.post('/', (req, res) => orderController.createOrder(req, res));

// GET /api/orders - Obtener todas las órdenes (con paginación)
router.get('/', (req, res) => orderController.getOrders(req, res));

// GET /api/orders/:id - Obtener orden por ID
router.get('/:id', (req, res) => orderController.getOrderById(req, res));

// GET /api/orders/user/:userId - Obtener órdenes por usuario
router.get('/user/:userId', (req, res) => orderController.getOrdersByUserId(req, res));

// GET /api/orders/number/:orderNumber - Obtener orden por número
router.get('/number/:orderNumber', (req, res) => orderController.getOrderByOrderNumber(req, res));

export default router; 