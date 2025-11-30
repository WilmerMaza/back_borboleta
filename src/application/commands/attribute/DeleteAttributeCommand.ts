import { ICommand } from '../../../domain/interfaces/ICommand';

export class DeleteAttributeCommand implements ICommand {
  constructor(private readonly id: number) {}

  get data(): { id: number } {
    return { id: this.id };
  }
}

