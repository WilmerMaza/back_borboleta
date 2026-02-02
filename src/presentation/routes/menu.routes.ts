import { Router } from 'express';
import { container } from 'tsyringe';
import { MenuController } from '../controllers/MenuController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const menuController = container.resolve(MenuController);

// GET públicos (sin token): el usuario no siempre está logeado
// GET /api/menus/hierarchy - Obtener estructura jerárquica completa (debe ir antes de /:id)
router.get('/hierarchy', (req, res) => menuController.getHierarchy(req, res));

// GET /api/menus - Listar menús
router.get('/', (req, res) => menuController.getAll(req, res));

// GET /api/menus/:id - Obtener un menú por ID
router.get('/:id', (req, res) => menuController.getById(req, res));

// Rutas de escritura requieren autenticación
router.post('/', authenticateToken, (req, res) => menuController.create(req, res));
router.put('/sort', authenticateToken, (req, res) => menuController.updateSort(req, res));
router.put('/:id', authenticateToken, (req, res) => menuController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => menuController.delete(req, res));

export default router;
