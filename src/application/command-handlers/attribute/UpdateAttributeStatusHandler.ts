import { injectable, inject } from 'tsyringe';
import { UpdateAttributeStatusCommand } from '../../commands/attribute/UpdateAttributeStatusCommand';
import { IAttributeRepository } from '../../../domain/repositories/IAttributeRepository';
import { IAttribute } from '../../../domain/entities/Attribute';

@injectable()
export class UpdateAttributeStatusHandler {
  constructor(
    @inject('AttributeRepository') private attributeRepository: IAttributeRepository
  ) {}

  async handle(command: UpdateAttributeStatusCommand): Promise<IAttribute> {
    const { id, status } = command.data;

    // Verificar que el atributo existe
    const existingAttribute = await this.attributeRepository.findById(id);
    if (!existingAttribute) {
      throw new Error(`Atributo con ID '${id}' no encontrado`);
    }

    // Actualizar el estado
    const updatedAttribute = await this.attributeRepository.updateStatus(id, status);

    if (!updatedAttribute) {
      throw new Error('Error al actualizar el estado del atributo');
    }

    return updatedAttribute;
  }
}

