import { injectable } from 'tsyringe';
import AttachmentModel from '../database/models/AttachmentModel';
import { IAttachmentRepository } from '../../domain/repositories/IAttachmentRepository';
import { Attachment } from '../../domain/entities/Attachment';

@injectable()
export class AttachmentRepository implements IAttachmentRepository {
  async create(attachment: Partial<Attachment>): Promise<Attachment> {
    const newAttachment = new AttachmentModel(attachment);
    const savedAttachment = await (newAttachment as any).save();
    return (savedAttachment as any).toObject() as Attachment;
  }

  async findById(id: number): Promise<Attachment | null> {
    const attachment = await AttachmentModel.findOne({ id });
    return attachment ? (attachment as any).toObject() as Attachment : null;
  }

  async findAll(filters?: {
    search?: string;
    mime_type?: string[];
    collection_name?: string;
    created_by_id?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Attachment[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
  }> {
    let query = AttachmentModel.find();

    // Aplicar filtros
    if (filters?.search) {
      query = query.where('name').regex(new RegExp(filters.search, 'i'));
    }

    if (filters?.mime_type && filters.mime_type.length > 0) {
      query = query.where('mime_type').in(filters.mime_type);
    }

    if (filters?.collection_name) {
      query = query.where('collection_name').equals(filters.collection_name);
    }

    if (filters?.created_by_id) {
      query = query.where('created_by_id').equals(filters.created_by_id);
    }

    // Aplicar ordenamiento
    if (filters?.sort) {
      const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
      const sortOrder = filters.sort.startsWith('-') ? -1 : 1;
      query = query.sort({ [sortField]: sortOrder });
    } else {
      query = query.sort({ created_at: -1 }); // Orden por defecto: más recientes primero
    }

    // Contar total de documentos
    const total = await AttachmentModel.countDocuments(query.getQuery());

    // Aplicar paginación
    const page = filters?.page || 1;
    const limit = filters?.limit || 15;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const data = await query.exec();
    const attachments = data.map(doc => (doc as any).toObject() as Attachment);

    return {
      data: attachments,
      total,
      current_page: page,
      per_page: limit,
      last_page: Math.ceil(total / limit)
    };
  }

  async update(id: number, attachment: Partial<Attachment>): Promise<Attachment | null> {
    const updatedAttachment = await AttachmentModel.findOneAndUpdate(
      { id },
      { ...attachment, updated_at: new Date() },
      { new: true }
    );
    return updatedAttachment ? (updatedAttachment as any).toObject() as Attachment : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await AttachmentModel.findOneAndDelete({ id });
    return !!result;
  }

  async findByFileName(fileName: string): Promise<Attachment | null> {
    const attachment = await AttachmentModel.findOne({ file_name: fileName });
    return attachment ? (attachment as any).toObject() as Attachment : null;
  }

  async findByFilePath(filePath: string): Promise<Attachment | null> {
    const attachment = await AttachmentModel.findOne({ file_path: filePath });
    return attachment ? (attachment as any).toObject() as Attachment : null;
  }
}
