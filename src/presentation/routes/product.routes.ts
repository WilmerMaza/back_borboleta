import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { ProductController } from '../controllers/ProductController';

const router = Router();
const productController = container.resolve(ProductController);

// Obtener productos
router.get('/', (req, res) => productController.getProducts(req, res));

// Crear producto
router.post('/', (req, res) => productController.createProduct(req, res));

export default router; 