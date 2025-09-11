import { injectable, inject } from 'tsyringe';
import { IAddressRepository } from '../../../domain/repositories/IAddressRepository';
import { CreateAddressCommand } from '../../commands/address/CreateAddressCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class CreateAddressHandler {
  constructor(
    @inject('AddressRepository') private addressRepository: IAddressRepository
  ) {}

  async handle(command: CreateAddressCommand): Promise<any> {
    try {
      Logger.log('Creando nueva dirección para usuario:', command.getUserId);
      Logger.log('Datos de la dirección:', command.getAddressData);

      // Si se marca como default, quitar el flag de default de otras direcciones
      if (command.getAddressData.is_default) {
        await this.addressRepository.setDefaultAddress(command.getUserId, 0);
      }

      const addressData = {
        ...command.getAddressData,
        user_id: command.getUserId
      };

      Logger.log('Datos finales para crear dirección:', addressData);
      const newAddress = await this.addressRepository.create(addressData);

      // Si se marcó como default, actualizar la dirección recién creada
      if (command.getAddressData.is_default) {
        await this.addressRepository.setDefaultAddress(command.getUserId, newAddress.id!);
        newAddress.is_default = true;
      }

      return newAddress;
    } catch (error: any) {
      Logger.error('Error en CreateAddressHandler:', error);
      throw error;
    }
  }
}
