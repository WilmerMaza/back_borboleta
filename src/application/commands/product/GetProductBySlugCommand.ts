import { ICommand } from '../../../domain/interfaces/ICommand';

export class GetProductBySlugCommand implements ICommand {
  constructor(private readonly slug: string) {}

  get data(): { slug: string } {
    return { slug: this.slug };
  }
} 