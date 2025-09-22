import express from 'express';
import { container } from 'tsyringe';
import { UserController } from '../presentation/controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const userController = container.resolve(UserController);

// Rutas públicas para usuarios
router.post('/register', userController.handleRegisterUser);
router.post('/login', userController.handleLogin);
router.post('/login-phone', userController.handleLoginPhone);
router.post('/verify-email-otp', userController.handleVerifyEmailOTP);
router.post('/verify-phone-otp', userController.handleVerifyPhoneOTP);
router.post('/forgot-password', userController.handleForgotPassword);
router.post('/update-password', userController.handleUpdatePassword);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, userController.handleGetUserProfile);
router.get('/test-token', authenticateToken, userController.handleTestToken);

// Gestión de usuarios (requieren autenticación)
router.get('/', authenticateToken, userController.handleGetUsers);
router.put('/:id', authenticateToken, userController.handleUpdateUser);
router.delete('/:id', authenticateToken, userController.handleDeleteUser);

export default router;