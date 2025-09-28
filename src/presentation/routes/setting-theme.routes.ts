import { Router } from 'express';
import { SettingThemeController } from '../controllers/SettingThemeController';

const router = Router();
const settingThemeController = new SettingThemeController();

// Obtener todos los temas
router.get('/', (req, res) => settingThemeController.getAllThemes(req, res));

// Obtener tema por nombre
router.get('/:name', (req, res) => settingThemeController.getThemeByName(req, res));

// Obtener tema por slug
router.get('/slug/:slug', (req, res) => settingThemeController.getThemeBySlug(req, res));

// Crear/actualizar tema
router.post('/', (req, res) => settingThemeController.saveTheme(req, res));

// Eliminar tema
router.delete('/:name', (req, res) => settingThemeController.deleteTheme(req, res));

export default router; 