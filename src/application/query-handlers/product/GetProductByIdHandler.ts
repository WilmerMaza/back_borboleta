import { injectable } from 'tsyringe';
import { GetProductByIdQuery } from '../../queries/product/GetProductByIdQuery';
import { IProduct } from '../../../domain/entities/Product';

@injectable()
export class GetProductByIdHandler {
  async handle(query: GetProductByIdQuery): Promise<IProduct | null> {
    return await query.getRepository.findById(query.getId.toString());
  }
}