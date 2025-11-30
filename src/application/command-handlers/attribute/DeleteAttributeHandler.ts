import { injectable, inject } from 'tsyringe';
import { DeleteAttributeCommand } from '../../commands/attribute/DeleteAttributeCommand';
import { IAttributeRepository } from '../../../domain/repositories/IAttributeRepository';

@injectable()
export class DeleteAttributeHandler {
  constructor(
    @inject('AttributeRepository') private attributeRepository: IAttributeRepository
  ) {}

  async handle(command: DeleteAttributeCommand): Promise<boolean> {
    const { id } = command.data;

    // Verificar que el atributo existe
    const existingAttribute = await this.attributeRepository.findById(id);
    if (!existingAttribute) {
      throw new Error(`Atributo con ID '${id}' no encontrado`);
    }

    // Eliminar el atributo (soft delete)
    const deleted = await this.attributeRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar el atributo');
    }

    return deleted;
  }
}

