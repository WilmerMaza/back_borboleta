import { Router } from 'express';
import { container } from 'tsyringe';
import { RoleController } from '../controllers/RoleController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const roleController = container.resolve(RoleController);

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/roles - Obtener todos los roles
router.get('/', (req, res) => roleController.getRoles(req, res));

// GET /api/roles/:id - Obtener rol por ID
router.get('/:id', (req, res) => roleController.getRoleById(req, res));

// POST /api/roles - Crear rol
router.post('/', (req, res) => roleController.createRole(req, res));

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', (req, res) => roleController.updateRole(req, res));

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id', (req, res) => roleController.deleteRole(req, res));

// POST /api/roles/:id/permissions - Asignar permisos a un rol
router.post('/:id/permissions', (req, res) => roleController.assignPermissions(req, res));

// DELETE /api/roles/:id/permissions - Remover permisos de un rol
router.delete('/:id/permissions', (req, res) => roleController.removePermissions(req, res));

export default router;