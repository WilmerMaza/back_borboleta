import { Router } from 'express';
import { UnifiedAuthController } from '../controllers/UnifiedAuthController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const unifiedAuthController = new UnifiedAuthController();

// ===== FRONTEND ROUTES =====
// POST /api/users/login - Login para frontend (clientes)
router.post('/users/login', unifiedAuthController.loginFrontend);

// GET /api/users/me - Obtener información del usuario autenticado (frontend)
router.get('/users/me', authenticateToken, unifiedAuthController.getMeFrontend);

// ===== BACKOFFICE ROUTES =====
// POST /api/admin/login - Login para backoffice (staff)
router.post('/admin/login', unifiedAuthController.loginBackoffice);

// GET /api/admin/me - Obtener información del usuario autenticado (backoffice)
router.get('/admin/me', authenticateToken, unifiedAuthController.getMeBackoffice);

export default router;
