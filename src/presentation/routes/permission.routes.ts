import { Router } from 'express';
import { container } from 'tsyringe';
import { PermissionController } from '../controllers/PermissionController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const permissionController = container.resolve(PermissionController);

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/permissions - Obtener todos los permisos
router.get('/', (req, res) => permissionController.getPermissions(req, res));

// GET /api/permissions/modules - Obtener módulos de permisos
router.get('/modules', (req, res) => permissionController.getPermissionModules(req, res));

// GET /api/permissions/:id - Obtener permiso por ID
router.get('/:id', (req, res) => permissionController.getPermissionById(req, res));

// POST /api/permissions - Crear permiso
router.post('/', (req, res) => permissionController.createPermission(req, res));

// PUT /api/permissions/:id - Actualizar permiso
router.put('/:id', (req, res) => permissionController.updatePermission(req, res));

// DELETE /api/permissions/:id - Eliminar permiso
router.delete('/:id', (req, res) => permissionController.deletePermission(req, res));

export default router;
