import { Router } from 'express';
import multer from 'multer';
import { AttachmentController } from '../controllers/AttachmentController';

const router = Router();
const attachmentController = new AttachmentController();

// Configuración de multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por archivo
    files: 10 // Máximo 10 archivos por request
  },
  fileFilter: (_req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
  }
});

// GET /api/attachments - Obtener todos los attachments con filtros y paginación
router.get('/', (req, res) => 
  attachmentController.getAttachments(req, res)
);

// GET /api/attachments/:id - Obtener un attachment por ID
router.get('/:id', (req, res) => 
  attachmentController.getAttachmentById(req, res)
);

// POST /api/upload/files - Subir archivos
router.post('/upload/files', upload.array('files[]'), (req, res) => 
  attachmentController.uploadFiles(req, res)
);

// PUT /api/attachments/:id - Actualizar un attachment
router.put('/:id', (req, res) => 
  attachmentController.updateAttachment(req, res)
);

// DELETE /api/attachments/:id - Eliminar un attachment
router.delete('/:id', (req, res) => 
  attachmentController.deleteAttachment(req, res)
);

export default router;
