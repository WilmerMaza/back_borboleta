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
    
    // Convertir ID a número si es string (como está guardado en la base de datos)
    const categoryId = typeof id === 'string' ? parseInt(id) : id;
    
    // Verificar que la categoría existe usando el ID numérico
    const existingCategory = await this.categoryRepository.findByAutoIncrementId(categoryId);
    if (!existingCategory) {
      throw new Error(`Categoría con ID '${id}' no encontrada`);
    }

    // Verificar si tiene subcategorías usando el ID numérico como string
    const subcategories = await this.categoryRepository.findSubcategories(categoryId.toString());
    if (subcategories.length > 0) {
      throw new Error('No se puede eliminar una categoría que tiene subcategorías. Elimine las subcategorías primero.');
    }

    // Eliminar usando el ID numérico
    const deleted = await this.categoryRepository.deleteByAutoIncrementId(categoryId);
    
    if (!deleted) {
      throw new Error('Error al eliminar la categoría');
    }
    
    return deleted;
  }
} 