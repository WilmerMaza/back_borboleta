import express from 'express';
import { container } from 'tsyringe';
import { UserController } from '../presentation/controllers/UserController';

const router = express.Router();
const userController = container.resolve(UserController);

// Rutas para usuarios
router.post('/register', userController.handleRegisterUser);
// Aquí puedes agregar más rutas como:
// router.post('/login', userController.handleLogin);
// router.get('/profile/:id', userController.handleGetUserProfile);
// router.put('/profile/:id', userController.handleUpdateUserProfile);

export default router;