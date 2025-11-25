import { injectable, inject } from 'tsyringe';
import { GetAttributeByIdQuery } from '../../queries/attribute/GetAttributeByIdQuery';
import { IAttributeRepository } from '../../../domain/repositories/IAttributeRepository';
import { IAttribute } from '../../../domain/entities/Attribute';

@injectable()
export class GetAttributeByIdHandler {
  constructor(
    @inject('AttributeRepository') private attributeRepository: IAttributeRepository
  ) {}

  async handle(query: GetAttributeByIdQuery): Promise<IAttribute | null> {
    const { id } = query.data;
    return await this.attributeRepository.findById(id);
  }
}

