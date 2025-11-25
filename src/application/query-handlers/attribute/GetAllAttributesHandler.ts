import { injectable, inject } from 'tsyringe';
import { GetAllAttributesQuery } from '../../queries/attribute/GetAllAttributesQuery';
import { IAttributeRepository } from '../../../domain/repositories/IAttributeRepository';

@injectable()
export class GetAllAttributesHandler {
  constructor(
    @inject('AttributeRepository') private attributeRepository: IAttributeRepository
  ) {}

  async handle(query: GetAllAttributesQuery) {
    const params = query.data;
    return await this.attributeRepository.findAll(params);
  }
}

