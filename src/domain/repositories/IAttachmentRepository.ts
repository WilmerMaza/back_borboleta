import { Attachment } from '../entities/Attachment';

export interface IAttachmentRepository {
  create(attachment: Partial<Attachment>): Promise<Attachment>;
  findById(id: number): Promise<Attachment | null>;
  findAll(filters?: {
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
  }>;
  update(id: number, attachment: Partial<Attachment>): Promise<Attachment | null>;
  delete(id: number): Promise<boolean>;
  findByFileName(fileName: string): Promise<Attachment | null>;
  findByFilePath(filePath: string): Promise<Attachment | null>;
}
