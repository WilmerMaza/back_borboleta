import { ICommand } from '../../../domain/interfaces/ICommand';
import { ICategory } from '../../../domain/entities/Category';

export class UpdateCategoryCommand implements ICommand {
  constructor(
    private readonly id: string,
    private readonly categoryData: Partial<ICategory>
  ) {}

  get data(): { id: string; update: Partial<ICategory> } {
    return { id: this.id, update: this.categoryData };
  }
} 