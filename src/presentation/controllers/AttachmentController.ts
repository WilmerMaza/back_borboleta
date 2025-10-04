import { Request, Response } from 'express';
import { container } from '../../infrastructure/di/registry';
import { AttachmentService } from '../../application/services/AttachmentService';

export class AttachmentController {
  private attachmentService: AttachmentService;

  constructor() {
    this.attachmentService = container.resolve(AttachmentService);
  }

  /**
   * GET /api/attachments
   * Obtiene todos los attachments con filtros y paginación
   */
  async getAttachments(req: Request, res: Response): Promise<void> {
    try {
      const { search, field, mime_type, sort, page, paginate } = req.query;

      // Validar parámetros de paginación
      const pageNum = page ? parseInt(page as string) : 1;
      const paginateNum = paginate ? parseInt(paginate as string) : 15;

      if (pageNum < 1) {
        res.status(400).json({
          success: false,
          message: 'El número de página debe ser mayor a 0'
        });
        return;
      }

      if (paginateNum < 1 || paginateNum > 100) {
        res.status(400).json({
          success: false,
          message: 'El número de elementos por página debe estar entre 1 y 100'
        });
        return;
      }

      const result = await this.attachmentService.getAttachments({
        search: search as string,
        field: field as string,
        mime_type: mime_type as string,
        sort: sort as string,
        page: pageNum,
        paginate: paginateNum
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error en getAttachments:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener archivos',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * GET /api/attachments/:id
   * Obtiene un attachment por ID
   */
  async getAttachmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attachmentId = parseInt(id);

      if (isNaN(attachmentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de attachment inválido'
        });
        return;
      }

      const attachment = await this.attachmentService.getAttachmentById(attachmentId);

      if (!attachment) {
        res.status(404).json({
          success: false,
          message: 'Attachment no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: attachment
      });
    } catch (error) {
      console.error('Error en getAttachmentById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el archivo',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * POST /api/upload/files
   * Sube archivos a Firebase Storage y crea registros en la base de datos
   */
  async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const createdById = (req as any).user?.id || 1; // TODO: Obtener del middleware de autenticación

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No se proporcionaron archivos para subir'
        });
        return;
      }

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

      const invalidFiles = files.filter(file => !allowedMimeTypes.includes(file.mimetype));
      if (invalidFiles.length > 0) {
        res.status(400).json({
          success: false,
          message: `Tipos de archivo no permitidos: ${invalidFiles.map(f => f.mimetype).join(', ')}`
        });
        return;
      }

      // Validar tamaño de archivos (máximo 10MB por archivo)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        res.status(400).json({
          success: false,
          message: `Archivos demasiado grandes (máximo 10MB): ${oversizedFiles.map(f => f.originalname).join(', ')}`
        });
        return;
      }

      const uploadedAttachments = await this.attachmentService.uploadFiles(files, createdById);

      res.status(201).json({
        success: true,
        data: uploadedAttachments,
        message: `${uploadedAttachments.length} archivo(s) subido(s) correctamente`
      });
    } catch (error) {
      console.error('Error en uploadFiles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al subir archivos',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * DELETE /api/attachments/:id
   * Elimina un attachment y su archivo de Firebase Storage
   */
  async deleteAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attachmentId = parseInt(id);

      if (isNaN(attachmentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de attachment inválido'
        });
        return;
      }

      const deleted = await this.attachmentService.deleteAttachment(attachmentId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Attachment no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Archivo eliminado correctamente'
      });
    } catch (error) {
      console.error('Error en deleteAttachment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el archivo',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * PUT /api/attachments/:id
   * Actualiza un attachment
   */
  async updateAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const attachmentId = parseInt(id);
      const updateData = req.body;

      if (isNaN(attachmentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de attachment inválido'
        });
        return;
      }

      // Campos que no se pueden actualizar directamente
      const restrictedFields = ['id', 'file_path', 'original_url', 'asset_url', 'created_at', 'updated_at'];
      const hasRestrictedFields = Object.keys(updateData).some(key => restrictedFields.includes(key));
      
      if (hasRestrictedFields) {
        res.status(400).json({
          success: false,
          message: `No se pueden actualizar los campos: ${restrictedFields.join(', ')}`
        });
        return;
      }

      const updatedAttachment = await this.attachmentService.updateAttachment(attachmentId, updateData);

      if (!updatedAttachment) {
        res.status(404).json({
          success: false,
          message: 'Attachment no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedAttachment,
        message: 'Archivo actualizado correctamente'
      });
    } catch (error) {
      console.error('Error en updateAttachment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el archivo',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
}
