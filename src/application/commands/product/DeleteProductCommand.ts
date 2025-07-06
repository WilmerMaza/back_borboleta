import { ICommand } from '../../../domain/interfaces/ICommand';

export class DeleteProductCommand implements ICommand {
  constructor(private readonly id: string) {}

  get data(): { id: string } {
    return { id: this.id };
  }
} 