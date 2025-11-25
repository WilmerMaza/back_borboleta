import { IAttribute } from '../entities/Attribute';

export interface IAttributeRepository {
  create(attribute: Partial<IAttribute>): Promise<IAttribute>;
  findAll(options?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: boolean;
    style?: string;
  }): Promise<{ data: IAttribute[]; total: number; current_page: number; per_page: number; last_page: number }>;
  findById(id: number): Promise<IAttribute | null>;
  findBySlug(slug: string): Promise<IAttribute | null>;
  findByName(name: string): Promise<IAttribute | null>;
  update(id: number, attribute: Partial<IAttribute>): Promise<IAttribute | null>;
  updateStatus(id: number, status: boolean): Promise<IAttribute | null>;
  delete(id: number): Promise<boolean>;
  deleteMultiple(ids: number[]): Promise<{ deleted: number; failed: number }>;
}

