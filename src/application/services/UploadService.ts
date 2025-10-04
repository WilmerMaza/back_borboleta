import { uploadFile, deleteFile, getFileURL } from '../../config/firebase';

export interface UploadUrlResponse {
  url: string;
  expires_at: string;
}

export interface UploadUrlsResponse {
  file_path: string;
  url: string;
  expires_at: string;
}

export class UploadService {
  /**
   * Sube un archivo directamente a Firebase Storage
   */
  async uploadFile(file: Buffer, filePath: string, contentType: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const result = await uploadFile(file, filePath, contentType);
      return result;
    } catch (error) {
      console.error('Error en UploadService.uploadFile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Genera una URL simulada para subir un archivo (SDK Web no soporta URLs firmadas de upload)
   * @param filePath - Ruta del archivo en Firebase Storage
   * @param expiresIn - Tiempo de expiración en segundos (por defecto 1 hora)
   * @returns URL simulada y fecha de expiración
   */
  async getUploadUrl(filePath: string, expiresIn: number = 3600): Promise<UploadUrlResponse> {
    // Con SDK Web no podemos generar URLs firmadas de upload
    // Retornamos una URL simulada para compatibilidad
    const simulatedUrl = `https://firebasestorage.googleapis.com/v0/b/borboleta-f137e.firebasestorage.app/o/${encodeURIComponent(filePath)}?alt=media&token=simulated`;
    
    return {
      url: simulatedUrl,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
    };
  }

  /**
   * Genera URLs simuladas para subir múltiples archivos (SDK Web no soporta URLs firmadas de upload)
   * @param filePaths - Array de rutas de archivos en Firebase Storage
   * @param expiresIn - Tiempo de expiración en segundos (por defecto 1 hora)
   * @returns Array de URLs simuladas con sus fechas de expiración
   */
  async getUploadUrls(filePaths: string[], expiresIn: number = 3600): Promise<UploadUrlsResponse[]> {
    return filePaths.map(filePath => ({
      file_path: filePath,
      url: `https://firebasestorage.googleapis.com/v0/b/borboleta-f137e.firebasestorage.app/o/${encodeURIComponent(filePath)}?alt=media&token=simulated`,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
    }));
  }

  /**
   * Obtiene la URL de descarga de un archivo
   * @param filePath - Ruta del archivo en Firebase Storage
   * @returns URL de descarga
   */
  async getDownloadUrl(filePath: string): Promise<string> {
    try {
      const result = await getFileURL(filePath);
      if (result.success && result.url) {
        return result.url;
      } else {
        throw new Error(result.error || 'Error al obtener URL del archivo');
      }
    } catch (error) {
      console.error('Error generando URL de descarga:', error);
      throw new Error('Error al generar URL de descarga');
    }
  }

  /**
   * Elimina un archivo de Firebase Storage
   * @param filePath - Ruta del archivo a eliminar
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const result = await deleteFile(filePath);
      return result.success;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      return false;
    }
  }

  /**
   * Verifica si un archivo existe en Firebase Storage
   * @param filePath - Ruta del archivo a verificar
   * @returns true si el archivo existe, false en caso contrario
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const result = await getFileURL(filePath);
      return result.success;
    } catch (error) {
      console.error('Error verificando existencia del archivo:', error);
      return false;
    }
  }
}
