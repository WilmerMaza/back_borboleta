import { IAttributeValue } from '../entities/AttributeValue';

export interface IAttributeValueRepository {
  create(attributeValue: Partial<IAttributeValue>): Promise<IAttributeValue>;
  findAll(options?: {
    attribute_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<{ data: IAttributeValue[]; total: number }>;
  findById(id: number): Promise<IAttributeValue | null>;
  findByAttributeId(attributeId: number): Promise<IAttributeValue[]>;
  update(id: number, attributeValue: Partial<IAttributeValue>): Promise<IAttributeValue | null>;
  delete(id: number): Promise<boolean>;
  deleteMultiple(ids: number[]): Promise<{ deleted: number; failed: number }>;
  deleteByAttributeId(attributeId: number): Promise<boolean>;
}

