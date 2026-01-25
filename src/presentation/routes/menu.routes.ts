import { Router } from 'express';
import { container } from 'tsyringe';
import { MenuController } from '../controllers/MenuController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const menuController = container.resolve(MenuController);

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/menus/hierarchy - Obtener estructura jerárquica completa (debe ir antes de /:id)
router.get('/hierarchy', (req, res) => menuController.getHierarchy(req, res));

// GET /api/menus - Listar menús
router.get('/', (req, res) => menuController.getAll(req, res));

// GET /api/menus/:id - Obtener un menú por ID
router.get('/:id', (req, res) => menuController.getById(req, res));

// POST /api/menus - Crear menú
router.post('/', (req, res) => menuController.create(req, res));

// PUT /api/menus/:id - Actualizar menú
router.put('/:id', (req, res) => menuController.update(req, res));

// PUT /api/menus/sort - Actualizar orden de menús
router.put('/sort', (req, res) => menuController.updateSort(req, res));

// DELETE /api/menus/:id - Eliminar menú
router.delete('/:id', (req, res) => menuController.delete(req, res));

export default router;
