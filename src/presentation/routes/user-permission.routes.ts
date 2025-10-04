import { Router } from 'express';
import { container } from 'tsyringe';
import { UserPermissionController } from '../controllers/UserPermissionController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const userPermissionController = container.resolve(UserPermissionController);

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/users/:id/permissions - Obtener permisos de un usuario
router.get('/:id/permissions', (req, res) => userPermissionController.getUserPermissions(req, res));

// PUT /api/users/:id/permissions - Asignar permisos a un usuario
router.put('/:id/permissions', (req, res) => userPermissionController.assignUserPermissions(req, res));

export default router;


