import { Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateAddressCommand } from '../../application/commands/address/CreateAddressCommand';
import { CreateAddressHandler } from '../../application/command-handlers/address/CreateAddressHandler';
import { UpdateAddressCommand } from '../../application/commands/address/UpdateAddressCommand';
import { UpdateAddressHandler } from '../../application/command-handlers/address/UpdateAddressHandler';
import { DeleteAddressCommand } from '../../application/commands/address/DeleteAddressCommand';
import { DeleteAddressHandler } from '../../application/command-handlers/address/DeleteAddressHandler';
import { GetUserAddressesQuery } from '../../application/queries/address/GetUserAddressesQuery';
import { GetUserAddressesHandler } from '../../application/query-handlers/address/GetUserAddressesHandler';
import { Logger } from '../../shared/utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth';
import { IAddressRepository } from '../../domain/repositories/IAddressRepository';
import { container } from 'tsyringe';

@injectable()
export class AddressController {
  constructor(
    @inject("CreateAddressHandler") private createAddressHandler: CreateAddressHandler,
    @inject("UpdateAddressHandler") private updateAddressHandler: UpdateAddressHandler,
    @inject("DeleteAddressHandler") private deleteAddressHandler: DeleteAddressHandler,
    @inject("GetUserAddressesHandler") private getUserAddressesHandler: GetUserAddressesHandler
  ) {}

  handleCreateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de creación de dirección recibida', req.body);
      Logger.log('Usuario autenticado:', req.user);
      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      if (!req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'ID de usuario no encontrado en el token'
        });
        return;
      }

      const command = new CreateAddressCommand(req.user.userId, req.body);
      const address = await this.createAddressHandler.handle(command);

      res.status(201).json({
        success: true,
        message: 'Dirección creada exitosamente',
        data: {
          address: address
        }
      });
    } catch (error: any) {
      Logger.error('Error al crear dirección:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear la dirección'
      });
    }
  };

  handleGetUserAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de direcciones del usuario recibida', req.user);
      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const addressRepository = container.resolve<IAddressRepository>('AddressRepository');
      const query = new GetUserAddressesQuery(req.user.userId, addressRepository);
      const addresses = await this.getUserAddressesHandler.handle(query);

      res.status(200).json({
        success: true,
        message: 'Direcciones obtenidas exitosamente',
        data: {
          addresses: addresses
        }
      });
    } catch (error: any) {
      Logger.error('Error al obtener direcciones:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las direcciones'
      });
    }
  };

  handleUpdateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de actualización de dirección recibida', req.body);
      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const addressId = parseInt(req.params.id);
      if (isNaN(addressId)) {
        res.status(400).json({
          success: false,
          message: 'ID de dirección inválido'
        });
        return;
      }

      const command = new UpdateAddressCommand(addressId, req.user.userId, req.body);
      const address = await this.updateAddressHandler.handle(command);

      if (!address) {
        res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Dirección actualizada exitosamente',
        data: {
          address: address
        }
      });
    } catch (error: any) {
      Logger.error('Error al actualizar dirección:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar la dirección'
      });
    }
  };

  handleDeleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de eliminación de dirección recibida', req.params);
      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const addressId = parseInt(req.params.id);
      if (isNaN(addressId)) {
        res.status(400).json({
          success: false,
          message: 'ID de dirección inválido'
        });
        return;
      }

      const command = new DeleteAddressCommand(addressId, req.user.userId);
      const deleted = await this.deleteAddressHandler.handle(command);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Dirección eliminada exitosamente'
      });
    } catch (error: any) {
      Logger.error('Error al eliminar dirección:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar la dirección'
      });
    }
  };
}
