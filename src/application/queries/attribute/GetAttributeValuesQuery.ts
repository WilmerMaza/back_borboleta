import { IQuery } from '../../../domain/interfaces/IQuery';

export interface GetAttributeValuesQueryParams {
  attribute_id?: number;
  page?: number;
  per_page?: number;
}

export class GetAttributeValuesQuery implements IQuery {
  constructor(private readonly params: GetAttributeValuesQueryParams) {}

  get data(): GetAttributeValuesQueryParams {
    return this.params;
  }
}

