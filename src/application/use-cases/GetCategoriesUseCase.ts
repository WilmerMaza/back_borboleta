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

    // Obtener categorías con paginación usando el repositorio
    const categories = await CategoryModel.find(filters)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Transformar las categorías para incluir todos los campos necesarios
    const transformedCategories = categories.map((category) => {
      const categoryObj = category.toObject();
      return {
        id: categoryObj.id,
        name: categoryObj.name,
        slug: categoryObj.slug || '', // Asegurar que slug esté presente
        description: categoryObj.description,
        type: categoryObj.type,
        parent_id: categoryObj.parent_id,
        category_image_id: categoryObj.category_image_id,
        category_icon_id: categoryObj.category_icon_id,
        category_meta_image_id: categoryObj.category_meta_image_id,
        commission_rate: categoryObj.commission_rate,
        products_count: categoryObj.products_count,
        meta_title: categoryObj.meta_title,
        meta_description: categoryObj.meta_description,
        status: categoryObj.status,
        created_by_id: categoryObj.created_by_id,
        created_at: categoryObj.created_at,
        updated_at: categoryObj.updated_at,
        deleted_at: categoryObj.deleted_at,
        subcategories: [] as ICategory[]
      };
    });

    // Solo obtener subcategorías si estamos obteniendo categorías principales (parent_id: null)
    if (parent_id === undefined || parent_id === null) {
      for (const category of transformedCategories) {
        const subcategories = await CategoryModel.find({ 
          parent_id: category.id.toString() 
        });
        
        // Transformar subcategorías también
        category.subcategories = subcategories.map((subcategory) => {
          const subObj = subcategory.toObject();
          return {
            id: subObj.id,
            name: subObj.name,
            slug: subObj.slug || '',
            description: subObj.description,
            type: subObj.type,
            parent_id: subObj.parent_id,
            category_image_id: subObj.category_image_id,
            category_icon_id: subObj.category_icon_id,
            category_meta_image_id: subObj.category_meta_image_id,
            commission_rate: subObj.commission_rate,
            products_count: subObj.products_count,
            meta_title: subObj.meta_title,
            meta_description: subObj.meta_description,
            status: subObj.status,
            created_by_id: subObj.created_by_id,
            created_at: subObj.created_at,
            updated_at: subObj.updated_at,
            deleted_at: subObj.deleted_at
          };
        });
      }
    }

    // Obtener total de documentos
    const total = await CategoryModel.countDocuments(filters);

    return {
      data: transformedCategories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    const category = await this.categoryRepository.findByAutoIncrementId(Number(id));
    if (!category) return null;
    
    // Transformar para incluir slug
    const categoryObj = (category as any).toObject();
    return {
      id: categoryObj.id,
      name: categoryObj.name,
      slug: categoryObj.slug || '',
      description: categoryObj.description,
      type: categoryObj.type,
      parent_id: categoryObj.parent_id,
      category_image_id: categoryObj.category_image_id,
      category_icon_id: categoryObj.category_icon_id,
      category_meta_image_id: categoryObj.category_meta_image_id,
      commission_rate: categoryObj.commission_rate,
      products_count: categoryObj.products_count,
      meta_title: categoryObj.meta_title,
      meta_description: categoryObj.meta_description,
      status: categoryObj.status,
      created_by_id: categoryObj.created_by_id,
      created_at: categoryObj.created_at,
      updated_at: categoryObj.updated_at,
      deleted_at: categoryObj.deleted_at,
      subcategories: []
    };
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) return null;
    
    // Transformar para incluir slug
    const categoryObj = (category as any).toObject();
    return {
      id: categoryObj.id,
      name: categoryObj.name,
      slug: categoryObj.slug || '',
      description: categoryObj.description,
      type: categoryObj.type,
      parent_id: categoryObj.parent_id,
      category_image_id: categoryObj.category_image_id,
      category_icon_id: categoryObj.category_icon_id,
      category_meta_image_id: categoryObj.category_meta_image_id,
      commission_rate: categoryObj.commission_rate,
      products_count: categoryObj.products_count,
      meta_title: categoryObj.meta_title,
      meta_description: categoryObj.meta_description,
      status: categoryObj.status,
      created_by_id: categoryObj.created_by_id,
      created_at: categoryObj.created_at,
      updated_at: categoryObj.updated_at,
      deleted_at: categoryObj.deleted_at,
      subcategories: []
    };
  }

  async getSubcategories(parentId: string): Promise<ICategory[]> {
    const subcategories = await this.categoryRepository.findSubcategories(parentId);
    
    // Transformar subcategorías para incluir slug
    return subcategories.map((subcategory) => {
      const subObj = (subcategory as any).toObject();
      return {
        id: subObj.id,
        name: subObj.name,
        slug: subObj.slug || '',
        description: subObj.description,
        type: subObj.type,
        parent_id: subObj.parent_id,
        category_image_id: subObj.category_image_id,
        category_icon_id: subObj.category_icon_id,
        category_meta_image_id: subObj.category_meta_image_id,
        commission_rate: subObj.commission_rate,
        products_count: subObj.products_count,
        meta_title: subObj.meta_title,
        meta_description: subObj.meta_description,
        status: subObj.status,
        created_by_id: subObj.created_by_id,
        created_at: subObj.created_at,
        updated_at: subObj.updated_at,
        deleted_at: subObj.deleted_at
      };
    });
  }
} 