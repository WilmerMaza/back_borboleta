import { injectable, inject } from 'tsyringe';
import { GetAttributeValuesQuery } from '../../queries/attribute/GetAttributeValuesQuery';
import { IAttributeValueRepository } from '../../../domain/repositories/IAttributeValueRepository';

@injectable()
export class GetAttributeValuesHandler {
  constructor(
    @inject('AttributeValueRepository') private attributeValueRepository: IAttributeValueRepository
  ) {}

  async handle(query: GetAttributeValuesQuery) {
    const params = query.data;
    return await this.attributeValueRepository.findAll(params);
  }
}

