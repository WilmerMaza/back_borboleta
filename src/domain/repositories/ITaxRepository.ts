import { ITax } from '../entities/Tax';

export interface ITaxRepository {
  create(tax: Partial<ITax>): Promise<ITax>;
  findAll(options?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    search?: string;
  }): Promise<{ data: ITax[]; total: number; current_page: number; per_page: number }>;
  findById(id: number): Promise<ITax | null>;
  update(id: number, tax: Partial<ITax>): Promise<ITax | null>;
  updateStatus(id: number, status: boolean): Promise<ITax | null>;
  delete(id: number): Promise<boolean>;
  deleteMultiple(ids: number[]): Promise<{ deleted: number; failed: number }>;
}
