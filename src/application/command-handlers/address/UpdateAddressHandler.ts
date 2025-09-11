import { injectable, inject } from 'tsyringe';
import { IAddressRepository } from '../../../domain/repositories/IAddressRepository';
import { UpdateAddressCommand } from '../../commands/address/UpdateAddressCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class UpdateAddressHandler {
  constructor(
    @inject('AddressRepository') private addressRepository: IAddressRepository
  ) {}

  async handle(command: UpdateAddressCommand): Promise<any> {
    try {
      Logger.log('Actualizando dirección:', command.getAddressId);

      // Verificar que la dirección pertenece al usuario
      const existingAddress = await this.addressRepository.findById(command.getAddressId);
      if (!existingAddress) {
        throw new Error('Dirección no encontrada');
      }

      if (existingAddress.user_id !== command.getUserId) {
        throw new Error('No tienes permisos para actualizar esta dirección');
      }

      // Si se marca como default, quitar el flag de default de otras direcciones
      if (command.getAddressData.is_default) {
        await this.addressRepository.setDefaultAddress(command.getUserId, command.getAddressId);
      }

      const updatedAddress = await this.addressRepository.update(
        command.getAddressId,
        command.getAddressData
      );

      return updatedAddress;
    } catch (error: any) {
      Logger.error('Error en UpdateAddressHandler:', error);
      throw error;
    }
  }
}


