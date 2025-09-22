import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const authController = container.resolve(AuthController);

// POST /api/auth/register - Registro de usuarios para back office
router.post('/register', (req, res) => authController.register(req, res));

// GET /api/auth/me - Obtener información del usuario autenticado (requiere autenticación)
router.get('/me', authenticateToken, (req, res) => authController.getMe(req, res));

// POST /api/auth/logout - Cerrar sesión (requiere autenticación)
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));

export default router;