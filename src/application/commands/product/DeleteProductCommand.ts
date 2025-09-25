import { ICommand } from '../../../domain/interfaces/ICommand';

export class DeleteProductCommand implements ICommand {
  constructor(private readonly id: number) {}

  get data(): { id: number } {
    return { id: this.id };
  }
} 