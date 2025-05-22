import { IQuery } from '../../../domain/interfaces/IQuery';

import { IProductRepository } from '../../../domain/repositories/IProductRepository';

export class GetProductByIdQuery implements IQuery {
  constructor(
    private readonly id: number,
    private readonly productRepository: IProductRepository
  ) {}

  get getId(): number {
    return this.id;
  }

  get getRepository(): IProductRepository {
    return this.productRepository;
  }
}


