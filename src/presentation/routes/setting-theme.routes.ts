import { Router } from 'express';
import { SettingThemeController } from '../controllers/SettingThemeController';

const router = Router();
const settingThemeController = new SettingThemeController();

// Obtener todos los temas
router.get('/', (req, res) => settingThemeController.getAllThemes(req, res));

// Obtener tema por slug (debe ir antes de /:name para evitar conflictos)
router.get('/slug/:slug', (req, res) => settingThemeController.getThemeBySlug(req, res));

// Crear tema
router.post('/', (req, res) => settingThemeController.saveTheme(req, res));

// Actualizar tema por slug
router.put('/:slug', (req, res) => settingThemeController.updateTheme(req, res));

// Obtener tema por nombre
router.get('/:name', (req, res) => settingThemeController.getThemeByName(req, res));

// Eliminar tema
router.delete('/:name', (req, res) => settingThemeController.deleteTheme(req, res));

export default router; 