import { injectable, inject } from 'tsyringe';
import { UpdateCategoryCommand } from '../../commands/category/UpdateCategoryCommand';
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';
import { ICategory } from '../../../domain/entities/Category';

@injectable()
export class UpdateCategoryHandler {
  constructor(
    @inject('CategoryRepository') private categoryRepository: CategoryRepository
  ) {}

  async handle(command: UpdateCategoryCommand): Promise<ICategory> {
    const { id, update } = command.data;
    
    // Verificar que la categoría existe
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error(`Categoría con ID '${id}' no encontrada`);
    }

    // Validar que si se está cambiando el nombre, sea único
    if (update.name && update.name !== existingCategory.name) {
      const categoryWithSameName = await this.categoryRepository.findByName(update.name);
      if (categoryWithSameName && categoryWithSameName.id !== existingCategory.id) {
        throw new Error('Ya existe una categoría con este nombre');
      }
    }

    // Validar que si se está cambiando parent_id, la categoría padre exista
    if (update.parent_id !== undefined && update.parent_id !== existingCategory.parent_id) {
      if (update.parent_id) {
        const parentCategory = await this.categoryRepository.findById(update.parent_id.toString());
        if (!parentCategory) {
          throw new Error('La categoría padre no existe');
        }
        
        // Evitar que una categoría se convierta en padre de sí misma
        if (update.parent_id.toString() === id) {
          throw new Error('Una categoría no puede ser padre de sí misma');
        }
      }
    }

    // Validar comisión si se está actualizando
    if (update.commission_rate !== undefined) {
      if (update.commission_rate < 0 || update.commission_rate > 100) {
        throw new Error('La comisión debe estar entre 0 y 100');
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, update);
    
    if (!updatedCategory) {
      throw new Error('Error al actualizar la categoría');
    }
    
    return updatedCategory;
  }
} 