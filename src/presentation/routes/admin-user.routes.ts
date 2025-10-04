import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { AdminUserController } from '../controllers/AdminUserController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const adminUserController = container.resolve(AdminUserController);

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// POST /api/admin/users - Crear usuario administrativo
router.post('/users', (req, res) => 
  adminUserController.createAdminUser(req, res)
);

// GET /api/admin/users - Listar usuarios administrativos
router.get('/users', (req, res) => 
  adminUserController.getAdminUsers(req, res)
);

// GET /api/admin/users/list - Lista simple de usuarios (DEBE ir antes de /users/:id)
router.get('/users/list', (req, res) => 
  adminUserController.getUsersList(req, res)
);

// GET /api/admin/users/:id - Obtener usuario administrativo por ID
router.get('/users/:id', (req, res) => 
  adminUserController.getAdminUserById(req, res)
);

// PUT /api/admin/users/:id - Actualizar usuario administrativo
router.put('/users/:id', (req, res) => 
  adminUserController.updateAdminUser(req, res)
);

// DELETE /api/admin/users/:id - Eliminar usuario administrativo
router.delete('/users/:id', (req, res) => 
  adminUserController.deleteAdminUser(req, res)
);

// PUT /api/admin/users/:id/password - Cambiar contraseña
router.put('/users/:id/password', (req, res) => 
  adminUserController.changePassword(req, res)
);

// GET /api/admin/users/departments/:department - Obtener usuarios por departamento
router.get('/users/departments/:department', (req, res) => 
  adminUserController.getUsersByDepartment(req, res)
);

export default router;
