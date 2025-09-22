import { injectable, inject } from 'tsyringe';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { ICategory } from '../../domain/entities/Category';
import CategoryModel from '../../infrastructure/database/models/CategoryModel';

export interface GetCategoriesOptions {
  parent_id?: number;
  status?: boolean;
  type?: string;
  limit?: number;
  page?: number;
}

export interface PaginatedCategories {
  data: ICategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@injectable()
export class GetCategoriesUseCase {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepository
  ) {}

  async execute(options: GetCategoriesOptions = {}): Promise<PaginatedCategories> {
    const { parent_id, status, type, limit = 10, page = 1 } = options;
    
    // Construir filtros
    const filters: any = {};
    
    if (parent_id !== undefined) {
      filters.parent_id = parent_id;
    } else {
      // Si no se especifica parent_id, obtener solo categorías principales
      filters.parent_id = null;
    }
    
    if (status !== undefined) {
      filters.status = status;
    }
    
    if (type) {
      filters.type = type;
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Obtener categorías con paginación
    const categories = await CategoryModel.find(filters)
      .populate('subcategories')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Obtener total de documentos
    const total = await CategoryModel.countDocuments(filters);

    return {
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await this.categoryRepository.findById(Number(id));
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return await this.categoryRepository.findBySlug(slug);
  }

  async getSubcategories(parentId: string): Promise<ICategory[]> {
    return await this.categoryRepository.findSubcategories(parentId);
  }
} 