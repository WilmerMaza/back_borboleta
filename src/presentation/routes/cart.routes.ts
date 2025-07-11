import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { CartController } from '../controllers/CartController';

const router = Router();
const cartController = container.resolve('CartController') as CartController;

// GET /api/cart - Obtener el carrito del usuario
router.get('/', (req, res) => cartController.getCart(req, res));

// POST /api/cart - Agregar producto al carrito
router.post('/', (req, res) => cartController.addToCart(req, res));

// PUT /api/cart/:cart_item_id - Actualizar cantidad de un producto
router.put('/:cart_item_id', (req, res) => cartController.updateCartItem(req, res));

// DELETE /api/cart/:cart_item_id - Eliminar producto del carrito
router.delete('/:cart_item_id', (req, res) => cartController.removeFromCart(req, res));

// DELETE /api/cart - Vaciar el carrito
router.delete('/', (req, res) => cartController.clearCart(req, res));

export default router; 