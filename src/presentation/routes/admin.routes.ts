import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminController } from '../controllers/AdminController';

const router = Router();
const adminController = container.resolve(AdminController);

// Endpoint temporal para asignar permisos de administrador
router.post('/assign-admin/:userId', (req, res) => adminController.assignAdminPermissions(req, res));

export default router;










