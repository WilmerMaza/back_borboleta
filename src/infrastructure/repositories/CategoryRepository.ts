import { injectable } from 'tsyringe';
import CategoryModel from '../database/models/CategoryModel';
import { ICategory } from '../../domain/entities/Category';

@injectable()
export class CategoryRepository {
  async create(categoryData: ICategory): Promise<ICategory> {
    const category = new CategoryModel(categoryData);
    return await category.save();
  }

  async findById(id: string): Promise<ICategory | null> {
    return await CategoryModel.findById(id).populate('subcategories');
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ slug }).populate('subcategories');
  }

  async findAll(): Promise<ICategory[]> {
    try {
      const categories = await CategoryModel.find({ parent_id: null }).populate('subcategories');
      
      // Transformar _id a id para compatibilidad con el frontend
      return categories.map(category => {
        const categoryObj = category.toObject();
        return {
          ...categoryObj,
          id: categoryObj._id
        };
      });
    } catch (error) {
      console.error('❌ Error en CategoryRepository.findAll:', error);
      throw new Error('Error al obtener categorías de la base de datos');
    }
  }

  async findSubcategories(parentId: string): Promise<ICategory[]> {
    return await CategoryModel.find({ parent_id: parentId });
  }

  async update(id: string, categoryData: Partial<ICategory>): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndUpdate(id, categoryData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ name });
  }
} 