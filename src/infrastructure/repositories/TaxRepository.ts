import { injectable } from "tsyringe";
import TaxModel from "../database/models/TaxModel";
import { ITax } from "../../domain/entities/Tax";
import { ITaxRepository } from "../../domain/repositories/ITaxRepository";

@injectable()
export class TaxRepository implements ITaxRepository {
  async create(tax: Partial<ITax>): Promise<ITax> {
    const taxDoc = new TaxModel(tax);
    const savedTax = await taxDoc.save();
    return savedTax.toObject();
  }

  async findAll(options?: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    search?: string;
  }): Promise<{ data: ITax[]; total: number; current_page: number; per_page: number }> {
    const page = options?.page || 1;
    const per_page = options?.per_page || 10;
    const skip = (page - 1) * per_page;

    // Construir filtros
    const filters: any = { deleted_at: null };
    
    if (options?.search) {
      filters.$or = [
        { name: { $regex: options.search, $options: 'i' } }
      ];
    }

    // Obtener total
    const total = await TaxModel.countDocuments(filters);
    
    // Construir ordenamiento
    const sortOptions: any = {};
    if (options?.sort_by) {
      const direction = options.sort_direction === 'desc' ? -1 : 1;
      sortOptions[options.sort_by] = direction;
    } else {
      sortOptions.created_at = -1; // Orden por defecto
    }
    
    // Obtener impuestos con paginación
    const taxes = await TaxModel.find(filters)
      .skip(skip)
      .limit(per_page)
      .sort(sortOptions);

    return {
      data: taxes.map(tax => tax.toObject()),
      total,
      current_page: page,
      per_page
    };
  }

  async findById(id: number): Promise<ITax | null> {
    const tax = await TaxModel.findOne({ id, deleted_at: null });
    return tax ? tax.toObject() : null;
  }

  async update(id: number, tax: Partial<ITax>): Promise<ITax | null> {
    const updated = await TaxModel.findOneAndUpdate(
      { id, deleted_at: null },
      tax,
      { new: true }
    );

    return updated ? updated.toObject() : null;
  }

  async updateStatus(id: number, status: boolean): Promise<ITax | null> {
    const updated = await TaxModel.findOneAndUpdate(
      { id, deleted_at: null },
      { status },
      { new: true }
    );

    return updated ? updated.toObject() : null;
  }

  async delete(id: number): Promise<boolean> {
    // Soft delete
    const result = await TaxModel.findOneAndUpdate(
      { id },
      { deleted_at: new Date() },
      { new: true }
    );
    
    return result !== null;
  }

  async deleteMultiple(ids: number[]): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.delete(id);
        if (result) {
          deleted++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { deleted, failed };
  }
}
