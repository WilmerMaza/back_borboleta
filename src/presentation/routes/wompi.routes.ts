import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { WompiController } from '../controllers/WompiController';
import { authenticateToken } from '../../middleware/auth';
import { AuthenticatedRequest } from '../../middleware/auth';

const router = Router();
const wompiController = container.resolve('WompiController') as WompiController;

router.post('/widget-data', authenticateToken, (req, res) =>
  wompiController.generateWidgetData(req as AuthenticatedRequest, res)
);

// NOTA: La ruta /webhook está definida directamente en index.ts con middleware RAW
// para que funcione correctamente con el body sin parsear

router.get('/verify/:reference', (req, res) =>
  wompiController.verifyTransaction(req, res)
);

export default router;

