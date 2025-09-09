import { injectable, inject } from 'tsyringe';
import { GetUserAddressesQuery } from '../../queries/address/GetUserAddressesQuery';
import { IAddress } from '../../../domain/entities/Address';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class GetUserAddressesHandler {
  constructor(
    @inject('AddressRepository') private addressRepository: any
  ) {}

  async handle(query: GetUserAddressesQuery): Promise<IAddress[]> {
    try {
      Logger.log('Obteniendo direcciones del usuario:', query.getUserId);
      
      const addresses = await this.addressRepository.findByUserId(query.getUserId);
      return addresses;
    } catch (error: any) {
      Logger.error('Error en GetUserAddressesHandler:', error);
      throw error;
    }
  }
}


