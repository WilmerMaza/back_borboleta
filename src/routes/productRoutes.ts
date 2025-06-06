import { Router } from 'express';
import { container } from 'tsyringe';
import { ProductController } from '../presentation/controllers/ProductController';

const router = Router();
const productController = container.resolve(ProductController);

router.post('/products', productController.createProduct);

export default router;