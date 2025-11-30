import { IQuery } from '../../../domain/interfaces/IQuery';

export interface GetAllAttributesQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: boolean;
  style?: string;
}

export class GetAllAttributesQuery implements IQuery {
  constructor(private readonly params: GetAllAttributesQueryParams) {}

  get data(): GetAllAttributesQueryParams {
    return this.params;
  }
}

