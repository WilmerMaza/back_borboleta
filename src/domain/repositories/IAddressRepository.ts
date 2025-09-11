import { IAddress } from '../entities/Address';

export interface IAddressRepository {
  create(address: IAddress): Promise<IAddress>;
  findById(id: number): Promise<IAddress | null>;
  findByUserId(userId: number): Promise<IAddress[]>;
  update(id: number, address: Partial<IAddress>): Promise<IAddress | null>;
  delete(id: number): Promise<boolean>;
  setDefaultAddress(userId: number, addressId: number): Promise<void>;
}


