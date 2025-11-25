import { IQuery } from '../../../domain/interfaces/IQuery';

export class GetAttributeByIdQuery implements IQuery {
  constructor(private readonly id: number) {}

  get data(): { id: number } {
    return { id: this.id };
  }
}

