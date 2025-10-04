import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';

const router = Router();
const uploadController = new UploadController();

// POST /api/upload/get-url - Generar URL para subir un archivo individual
router.post('/get-url', (req, res) => 
  uploadController.getUploadUrl(req, res)
);

// POST /api/upload/get-urls - Generar URLs para subir múltiples archivos
router.post('/get-urls', (req, res) => 
  uploadController.getUploadUrls(req, res)
);

// GET /api/upload/download-url/:filePath - Generar URL para descargar un archivo
router.get('/download-url/:filePath(*)', (req, res) => 
  uploadController.getDownloadUrl(req, res)
);

// DELETE /api/upload/:filePath - Eliminar un archivo
router.delete('/:filePath(*)', (req, res) => 
  uploadController.deleteFile(req, res)
);

// GET /api/upload/exists/:filePath - Verificar si un archivo existe
router.get('/exists/:filePath(*)', (req, res) => 
  uploadController.checkFileExists(req, res)
);

export default router;
