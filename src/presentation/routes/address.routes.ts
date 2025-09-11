import express from 'express';
import { container } from 'tsyringe';
import { AddressController } from '../controllers/AddressController';
import { authenticateToken } from '../../middleware/auth';

const router = express.Router();
const addressController = container.resolve(AddressController);

// Todas las rutas de direcciones requieren autenticación
router.post('/', authenticateToken, addressController.handleCreateAddress);
router.get('/', authenticateToken, addressController.handleGetUserAddresses);
router.put('/:id', authenticateToken, addressController.handleUpdateAddress);
router.delete('/:id', authenticateToken, addressController.handleDeleteAddress);

export default router;


