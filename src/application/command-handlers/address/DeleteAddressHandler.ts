import { injectable, inject } from 'tsyringe';
import { IAddressRepository } from '../../../domain/repositories/IAddressRepository';
import { DeleteAddressCommand } from '../../commands/address/DeleteAddressCommand';
import { Logger } from '../../../shared/utils/logger';

@injectable()
export class DeleteAddressHandler {
  constructor(
    @inject('AddressRepository') private addressRepository: IAddressRepository
  ) {}

  async handle(command: DeleteAddressCommand): Promise<boolean> {
    try {
      Logger.log('Eliminando dirección:', command.getAddressId);

      // Verificar que la dirección pertenece al usuario
      const existingAddress = await this.addressRepository.findById(command.getAddressId);
      if (!existingAddress) {
        throw new Error('Dirección no encontrada');
      }

      if (existingAddress.user_id !== command.getUserId) {
        throw new Error('No tienes permisos para eliminar esta dirección');
      }

      const deleted = await this.addressRepository.delete(command.getAddressId);
      return deleted;
    } catch (error: any) {
      Logger.error('Error en DeleteAddressHandler:', error);
      throw error;
    }
  }
}


