import { ICommand } from '../../../domain/interfaces/ICommand';

export class DeleteCategoryCommand implements ICommand {
  constructor(private readonly id: string) {}

  get data(): { id: string } {
    return { id: this.id };
  }
} 