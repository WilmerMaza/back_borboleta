import { Router } from 'express';
import { AdminUserAuthController } from '../controllers/AdminUserAuthController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const adminUserAuthController = new AdminUserAuthController();

// POST /api/admin/login - Login para AdminUser (sin autenticación requerida)
router.post('/login', adminUserAuthController.login);

// GET /api/admin/me - Obtener información del AdminUser autenticado (requiere autenticación)
router.get('/me', authenticateToken, adminUserAuthController.getMe);

export default router;
