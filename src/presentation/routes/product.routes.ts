import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { ProductController } from '../controllers/ProductController';

const router = Router();
const productController = container.resolve(ProductController);

// Obtener productos
router.get('/', (req, res) => productController.getProducts(req, res));

// Crear producto
router.post('/', (req, res) => productController.createProduct(req, res));

// Obtener producto por slug
router.get('/slug/:slug', (req, res) => productController.getProductBySlug(req, res));

// Actualizar producto
router.put('/:id', (req, res) => productController.updateProduct(req, res));

// Eliminar producto
router.delete('/:id', (req, res) => productController.deleteProduct(req, res));

export default router; 