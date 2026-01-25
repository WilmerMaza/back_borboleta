import { Router } from 'express';
import { container } from 'tsyringe';
import { TaxController } from '../controllers/TaxController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const taxController = container.resolve(TaxController);

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/taxes - Listar impuestos
router.get('/', (req, res) => taxController.getAll(req, res));

// GET /api/taxes/:id - Obtener un impuesto por ID
router.get('/:id', (req, res) => taxController.getById(req, res));

// POST /api/taxes - Crear impuesto
router.post('/', (req, res) => taxController.create(req, res));

// PUT /api/taxes/:id - Actualizar impuesto
router.put('/:id', (req, res) => taxController.update(req, res));

// PUT/PATCH /api/taxes/:id/status - Actualizar estado
router.put('/:id/status', (req, res) => taxController.updateStatus(req, res));
router.patch('/:id/status', (req, res) => taxController.updateStatus(req, res));

// DELETE /api/taxes/:id - Eliminar un impuesto
router.delete('/:id', (req, res) => taxController.delete(req, res));

// POST /api/taxes/delete-multiple - Eliminar múltiples impuestos
router.post('/delete-multiple', (req, res) => taxController.deleteMultiple(req, res));

export default router;
