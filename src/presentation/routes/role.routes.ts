import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { RoleController } from '../controllers/RoleController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const roleController = container.resolve(RoleController);

// GET /api/roles - Obtener todos los roles con sus permisos
router.get('/', authenticateToken, (req, res) => roleController.getAllRoles(req, res));

// POST /api/roles - Crear nuevo rol
router.post('/', authenticateToken, (req, res) => roleController.createRole(req, res));

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', authenticateToken, (req, res) => roleController.updateRole(req, res));

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id', authenticateToken, (req, res) => roleController.deleteRole(req, res));

// GET /api/modules - Obtener permisos organizados por módulos
router.get('/modules', authenticateToken, (req, res) => roleController.getModules(req, res));

export default router;






