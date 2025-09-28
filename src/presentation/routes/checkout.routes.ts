import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { CheckoutController } from '../controllers/CheckoutController';

const router = Router();
const checkoutController = container.resolve('CheckoutController') as CheckoutController;

// POST /api/checkout - Calcular totales antes de crear la orden
router.post('/', (req, res) => checkoutController.calculateCheckout(req, res));

export default router; 