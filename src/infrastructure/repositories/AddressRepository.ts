import { injectable } from 'tsyringe';
import { Logger } from '../../shared/utils/logger';
import { IAddressRepository } from 'src/domain/repositories/IAddressRepository';
import { IAddress } from 'src/domain/entities/Address';
import AddressModel from '../database/models/AddressModel';

@injectable()
export class AddressRepository implements IAddressRepository {
  async create(address: IAddress): Promise<IAddress> {
    try {
      console.log('Datos recibidos para crear dirección:', JSON.stringify(address, null, 2));
      const newAddress = new AddressModel(address);
      console.log('Modelo de dirección creado:', JSON.stringify(newAddress, null, 2));
      const savedAddress = await newAddress.save();
      console.log('Dirección guardada en la base de datos:', JSON.stringify(savedAddress, null, 2));
      return savedAddress.toObject();
    } catch (error) {
      console.error('Error al crear dirección en la base de datos:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<IAddress | null> {
    try {
      const address = await AddressModel.findOne({ id: id });
      return address ? address.toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar dirección con ID ${id}:`, error);
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<IAddress[]> {
    try {
      const addresses = await AddressModel.find({ user_id: userId });
      return addresses.map(address => address.toObject());
    } catch (error) {
      Logger.error(`Error al buscar direcciones del usuario ${userId}:`, error);
      throw error;
    }
  }

  async update(id: number, addressData: Partial<IAddress>): Promise<IAddress | null> {
    try {
      const updatedAddress = await AddressModel.findOneAndUpdate(
        { id: id },
        { $set: addressData },
        { new: true }
      );
      return updatedAddress ? updatedAddress.toObject() : null;
    } catch (error) {
      Logger.error(`Error al actualizar dirección con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await AddressModel.findOneAndDelete({ id: id });
      return !!result;
    } catch (error) {
      Logger.error(`Error al eliminar dirección con ID ${id}:`, error);
      throw error;
    }
  }

  async setDefaultAddress(userId: number, addressId: number): Promise<void> {
    try {
      // Primero, quitar el flag de default de todas las direcciones del usuario
      await AddressModel.updateMany(
        { user_id: userId },
        { $set: { is_default: false } }
      );

      // Luego, establecer la dirección específica como default
      await AddressModel.findOneAndUpdate(
        { id: addressId, user_id: userId },
        { $set: { is_default: true } }
      );
    } catch (error) {
      Logger.error(`Error al establecer dirección por defecto:`, error);
      throw error;
    }
  }
}


