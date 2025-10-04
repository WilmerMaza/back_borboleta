import { Request, Response } from 'express';
import { UploadService } from '../../application/services/UploadService';

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  /**
   * POST /api/upload/get-url
   * Genera una URL firmada para subir un archivo individual
   */
  async getUploadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { file_path, expires_in } = req.body;

      // Validaciones
      if (!file_path) {
        res.status(400).json({
          success: false,
          message: 'El campo file_path es requerido'
        });
        return;
      }

      if (typeof file_path !== 'string') {
        res.status(400).json({
          success: false,
          message: 'El campo file_path debe ser una cadena de texto'
        });
        return;
      }

      // Validar expires_in si se proporciona
      let expiresIn = 3600; // 1 hora por defecto
      if (expires_in !== undefined) {
        if (typeof expires_in !== 'number' || expires_in <= 0) {
          res.status(400).json({
            success: false,
            message: 'El campo expires_in debe ser un número positivo'
          });
          return;
        }
        expiresIn = expires_in;
      }

      const result = await this.uploadService.getUploadUrl(file_path, expiresIn);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en getUploadUrl:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * POST /api/upload/get-urls
   * Genera URLs firmadas para subir múltiples archivos
   */
  async getUploadUrls(req: Request, res: Response): Promise<void> {
    try {
      const { file_paths, expires_in } = req.body;

      // Validaciones
      if (!file_paths) {
        res.status(400).json({
          success: false,
          message: 'El campo file_paths es requerido'
        });
        return;
      }

      if (!Array.isArray(file_paths)) {
        res.status(400).json({
          success: false,
          message: 'El campo file_paths debe ser un array'
        });
        return;
      }

      if (file_paths.length === 0) {
        res.status(400).json({
          success: false,
          message: 'El array file_paths no puede estar vacío'
        });
        return;
      }

      // Validar que todos los elementos sean strings
      const invalidPaths = file_paths.filter(path => typeof path !== 'string');
      if (invalidPaths.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Todos los elementos en file_paths deben ser cadenas de texto'
        });
        return;
      }

      // Validar expires_in si se proporciona
      let expiresIn = 3600; // 1 hora por defecto
      if (expires_in !== undefined) {
        if (typeof expires_in !== 'number' || expires_in <= 0) {
          res.status(400).json({
            success: false,
            message: 'El campo expires_in debe ser un número positivo'
          });
          return;
        }
        expiresIn = expires_in;
      }

      const result = await this.uploadService.getUploadUrls(file_paths, expiresIn);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en getUploadUrls:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * GET /api/upload/download-url/:filePath
   * Genera una URL firmada para descargar un archivo
   */
  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { filePath } = req.params;
      const { expires_in } = req.query;

      if (!filePath) {
        res.status(400).json({
          success: false,
          message: 'La ruta del archivo es requerida'
        });
        return;
      }

      // Validar expires_in si se proporciona
      let expiresIn = 3600; // 1 hora por defecto
      if (expires_in !== undefined) {
        const parsedExpiresIn = parseInt(expires_in as string, 10);
        if (isNaN(parsedExpiresIn) || parsedExpiresIn <= 0) {
          res.status(400).json({
            success: false,
            message: 'El parámetro expires_in debe ser un número positivo'
          });
          return;
        }
        expiresIn = parsedExpiresIn;
      }

      const url = await this.uploadService.getDownloadUrl(filePath);

      res.status(200).json({
        success: true,
        data: {
          url,
          expires_in: expiresIn
        }
      });
    } catch (error) {
      console.error('Error en getDownloadUrl:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * DELETE /api/upload/:filePath
   * Elimina un archivo de Firebase Storage
   */
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { filePath } = req.params;

      if (!filePath) {
        res.status(400).json({
          success: false,
          message: 'La ruta del archivo es requerida'
        });
        return;
      }

      await this.uploadService.deleteFile(filePath);

      res.status(200).json({
        success: true,
        message: 'Archivo eliminado correctamente'
      });
    } catch (error) {
      console.error('Error en deleteFile:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * GET /api/upload/exists/:filePath
   * Verifica si un archivo existe en Firebase Storage
   */
  async checkFileExists(req: Request, res: Response): Promise<void> {
    try {
      const { filePath } = req.params;

      if (!filePath) {
        res.status(400).json({
          success: false,
          message: 'La ruta del archivo es requerida'
        });
        return;
      }

      const exists = await this.uploadService.fileExists(filePath);

      res.status(200).json({
        success: true,
        data: {
          file_path: filePath,
          exists
        }
      });
    } catch (error) {
      console.error('Error en checkFileExists:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
}
