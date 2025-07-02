import { injectable, inject } from 'tsyringe';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { ICategory } from '../../domain/entities/Category';

@injectable()
export class CreateCategoryUseCase {
  constructor(
    @inject('CategoryRepository')
    private categoryRepository: CategoryRepository
  ) {}

  async execute(categoryData: ICategory): Promise<ICategory> {
    // Validar que el nombre sea único
    const existingCategory = await this.categoryRepository.findByName(categoryData.name);
    if (existingCategory) {
      throw new Error('Ya existe una categoría con este nombre');
    }

    // Validar que si tiene parent_id, la categoría padre exista
    if (categoryData.parent_id) {
      const parentCategory = await this.categoryRepository.findById(categoryData.parent_id.toString());
      if (!parentCategory) {
        throw new Error('La categoría padre no existe');
      }
    }

    // Validar comisión si se proporciona
    if (categoryData.commission_rate !== undefined) {
      if (categoryData.commission_rate < 0 || categoryData.commission_rate > 100) {
        throw new Error('La comisión debe estar entre 0 y 100');
      }
    }

    // Crear la categoría
    const category = await this.categoryRepository.create({
      ...categoryData,
      status: categoryData.status ?? true
    });

    return category;
  }
} 