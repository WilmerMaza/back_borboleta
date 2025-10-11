import { injectable, inject } from 'tsyringe';
import { IAttachmentRepository } from '../../domain/repositories/IAttachmentRepository';
import { Attachment } from '../../domain/entities/Attachment';
import { uploadFile, deleteFile } from '../../config/firebase';

@injectable()
export class AttachmentService {
  constructor(
    @inject('IAttachmentRepository') private attachmentRepository: IAttachmentRepository
  ) {}

  /**
   * Sube archivos a Firebase Storage
   */
  private async uploadToFirebase(file: Buffer, filePath: string, contentType: string): Promise<string> {
    const result = await uploadFile(file, filePath, contentType);
    if (result.success && result.url) {
      return result.url;
    } else {
      throw new Error(result.error || 'Error al subir archivo a Firebase');
    }
  }

  /**
   * Obtiene todos los attachments con filtros y paginación
   */
  async getAttachments(filters?: {
    search?: string;
    field?: string;
    mime_type?: string;
    sort?: string;
    page?: number;
    paginate?: number;
  }): Promise<{
    data: Attachment[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
  }> {
    const mimeTypes = filters?.mime_type ? filters.mime_type.split(',') : undefined;
    
    return await this.attachmentRepository.findAll({
      search: filters?.search,
      mime_type: mimeTypes,
      sort: filters?.sort,
      page: filters?.page,
      limit: filters?.paginate
    });
  }

  /**
   * Obtiene un attachment por ID
   */
  async getAttachmentById(id: number): Promise<Attachment | null> {
    return await this.attachmentRepository.findById(id);
  }

  /**
   * Sube archivos a Firebase Storage y crea registros en la base de datos
   */
  async uploadFiles(files: any[], createdById: number): Promise<Attachment[]> {
    const uploadedAttachments: Attachment[] = [];

    for (const file of files) {
      try {
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.originalname}`;
        const filePath = `attachments/${fileName}`;

        // Subir archivo a Firebase Storage
        const downloadURL = await this.uploadToFirebase(file.buffer, filePath, file.mimetype);

        // Crear registro en la base de datos
        const attachmentData: Partial<Attachment> = {
          collection_name: 'default',
          name: file.originalname,
          file_name: fileName,
          mime_type: file.mimetype,
          disk: 'public',
          conversions_disk: 'public',
          size: file.size.toString(),
          original_url: downloadURL,
          asset_url: downloadURL,
          file_path: filePath,
          created_by_id: createdById
        };

        const attachment = await this.attachmentRepository.create(attachmentData);
        uploadedAttachments.push(attachment);

      } catch (error) {
        console.error(`Error subiendo archivo ${file.originalname}:`, error);
        throw new Error(`Error al subir archivo ${file.originalname}`);
      }
    }

    return uploadedAttachments;
  }

  /**
   * Elimina un attachment y su archivo de Firebase Storage
   */
  async deleteAttachment(id: number): Promise<boolean> {
    const attachment = await this.attachmentRepository.findById(id);
    
    if (!attachment) {
      return false;
    }

    try {
      // Eliminar archivo de Firebase Storage
      const result = await deleteFile(attachment.file_path);
      if (!result.deleted) {
        console.error('Error eliminando archivo de Firebase Storage');
      }
    } catch (error) {
      console.error('Error eliminando archivo de Firebase Storage:', error);
      // Continuar con la eliminación del registro aunque falle la eliminación del archivo
    }

    // Eliminar registro de la base de datos
    return await this.attachmentRepository.delete(id);
  }

  /**
   * Actualiza un attachment
   */
  async updateAttachment(id: number, updateData: Partial<Attachment>): Promise<Attachment | null> {
    return await this.attachmentRepository.update(id, updateData);
  }

  /**
   * Obtiene attachments por tipo MIME
   */
  async getAttachmentsByMimeType(mimeType: string): Promise<Attachment[]> {
    const result = await this.attachmentRepository.findAll({
      mime_type: [mimeType]
    });
    return result.data;
  }

  /**
   * Obtiene attachments por usuario creador
   */
  async getAttachmentsByUser(userId: number): Promise<Attachment[]> {
    const result = await this.attachmentRepository.findAll({
      created_by_id: userId
    });
    return result.data;
  }

  /**
   * Busca attachments por nombre
   */
  async searchAttachments(searchTerm: string): Promise<Attachment[]> {
    const result = await this.attachmentRepository.findAll({
      search: searchTerm
    });
    return result.data;
  }
}
