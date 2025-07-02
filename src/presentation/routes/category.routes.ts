import { Router } from 'express';
import { container } from 'tsyringe';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();
const categoryController = container.resolve(CategoryController);

// POST /api/categories - Crear nueva categoría
router.post('/', (req, res) => categoryController.create(req, res));

// GET /api/categories - Obtener todas las categorías (con filtros y paginación)
router.get('/', (req, res) => categoryController.getAll(req, res));

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', (req, res) => categoryController.getById(req, res));

// GET /api/categories/slug/:slug - Obtener categoría por slug
router.get('/slug/:slug', (req, res) => categoryController.getBySlug(req, res));

// GET /api/categories/:parentId/subcategories - Obtener subcategorías
router.get('/:parentId/subcategories', (req, res) => categoryController.getSubcategories(req, res));

export default router; 