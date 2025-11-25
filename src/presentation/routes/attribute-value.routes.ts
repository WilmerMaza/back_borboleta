import { Router } from 'express';
import { container } from 'tsyringe';
import { AttributeValueController } from '../controllers/AttributeValueController';

const router = Router();
const attributeValueController = container.resolve(AttributeValueController);

// GET /api/attribute-values - Listar todos los valores de atributos
router.get('/', (req, res) => attributeValueController.getAll(req, res));

export default router;

