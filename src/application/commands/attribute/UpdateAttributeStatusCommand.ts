import { ICommand } from '../../../domain/interfaces/ICommand';

export class UpdateAttributeStatusCommand implements ICommand {
  constructor(
    private readonly id: number,
    private readonly status: boolean
  ) {}

  get data(): { id: number; status: boolean } {
    return { id: this.id, status: this.status };
  }
}

