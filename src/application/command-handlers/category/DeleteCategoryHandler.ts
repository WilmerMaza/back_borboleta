import { injectable, inject } from 'tsyringe';
import { DeleteCategoryCommand } from '../../commands/category/DeleteCategoryCommand';
import { CategoryRepository } from '../../../infrastructure/repositories/CategoryRepository';

@injectable()
export class DeleteCategoryHandler {
  constructor(
    @inject('CategoryRepository') private categoryRepository: CategoryRepository
  ) {}

  async handle(command: DeleteCategoryCommand): Promise<boolean> {
    const { id } = command.data;
    
    // Verificar que la categoría existe
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new Error(`Categoría con ID '${id}' no encontrada`);
    }

    // Verificar si tiene subcategorías
    const subcategories = await this.categoryRepository.findSubcategories(id);
    if (subcategories.length > 0) {
      throw new Error('No se puede eliminar una categoría que tiene subcategorías. Elimine las subcategorías primero.');
    }

    const deleted = await this.categoryRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Error al eliminar la categoría');
    }
    
    return deleted;
  }
} 