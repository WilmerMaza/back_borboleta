import { Router } from 'express';
import { container } from '../../infrastructure/di/registry';
import { StatisticsController } from '../controllers/StatisticsController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const statisticsController = container.resolve(StatisticsController);

// GET /api/statistics - Obtener estadísticas del sistema
router.get('/statistics', authenticateToken, (req, res) => 
  statisticsController.getStatistics(req, res)
);

export default router;


