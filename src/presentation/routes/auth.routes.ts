import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const authController = container.resolve(AuthController);


router.post('/register', (req, res) => authController.register(req, res));


router.get('/me', authenticateToken, (req, res) => authController.getMe(req, res));

router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));

export default router;