import { ICommand } from '../../../domain/interfaces/ICommand';
import { ICategory } from '../../../domain/entities/Category';

export class CreateCategoryCommand implements ICommand {
  constructor(private readonly categoryData: ICategory) {}

  get data(): ICategory {
    return this.categoryData;
  }
} 