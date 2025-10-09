import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminController } from '../controllers/AdminController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const adminController = container.resolve(AdminController);

// ===== GESTIÓN DE USUARIOS (TODOS APUNTAN A LA COLECCIÓN USER) =====

// POST /api/admin/users - Crear usuario desde backoffice con rol dinámico
router.post('/users', authenticateToken, (req, res) => adminController.createUser(req, res));

// GET /api/admin/users - Listar usuarios para backoffice
router.get('/users', authenticateToken, (req, res) => adminController.getUsers(req, res));

// PUT /api/admin/users/:id - Actualizar usuario desde backoffice
router.put('/users/:id', authenticateToken, (req, res) => adminController.updateUser(req, res));

// DELETE /api/admin/users/:id - Eliminar usuario desde backoffice
router.delete('/users/:id', authenticateToken, (req, res) => adminController.deleteUser(req, res));

// Endpoint temporal para asignar permisos de administrador
router.post('/assign-admin/:userId', authenticateToken, (req, res) => adminController.assignAdminPermissions(req, res));

export default router;










