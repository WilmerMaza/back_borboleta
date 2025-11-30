import { ICommand } from '../../../domain/interfaces/ICommand';

export class DeleteMultipleAttributesCommand implements ICommand {
  constructor(private readonly ids: number[]) {}

  get data(): { ids: number[] } {
    return { ids: this.ids };
  }
}

