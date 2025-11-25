import { Router } from 'express';
import { container } from 'tsyringe';
import { AttributeController } from '../controllers/AttributeController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const attributeController = container.resolve(AttributeController);

// Rutas de atributos
// GET /api/attributes - Listar todos los atributos
router.get('/', (req, res) => attributeController.getAll(req, res));

// POST /api/attributes - Crear nuevo atributo
router.post('/', authenticateToken, (req, res) => attributeController.create(req, res));

// GET /api/attributes/:id - Ver un atributo específico
router.get('/:id', (req, res) => attributeController.getById(req, res));

// PUT /api/attributes/:id - Actualizar atributo
router.put('/:id', authenticateToken, (req, res) => attributeController.update(req, res));

// PATCH /api/attributes/:id/status - Cambiar estado del atributo
router.patch('/:id/status', authenticateToken, (req, res) => attributeController.updateStatus(req, res));

// DELETE /api/attributes/:id - Eliminar un atributo
router.delete('/:id', authenticateToken, (req, res) => attributeController.delete(req, res));

// POST /api/attributes/delete-multiple - Eliminar varios atributos
router.post('/delete-multiple', authenticateToken, (req, res) => attributeController.deleteMultiple(req, res));

export default router;

