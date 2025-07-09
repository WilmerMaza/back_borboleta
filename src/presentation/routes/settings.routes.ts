import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';

const router = Router();
const settingsController = new SettingsController();

// Obtener configuración
router.get('/', (req, res) => settingsController.getSettings(req, res));

// Actualizar configuración
router.put('/', (req, res) => settingsController.updateSettings(req, res));

export default router; 