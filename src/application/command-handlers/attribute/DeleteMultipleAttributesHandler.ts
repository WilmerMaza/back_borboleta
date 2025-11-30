import { injectable, inject } from 'tsyringe';
import { DeleteMultipleAttributesCommand } from '../../commands/attribute/DeleteMultipleAttributesCommand';
import { IAttributeRepository } from '../../../domain/repositories/IAttributeRepository';

@injectable()
export class DeleteMultipleAttributesHandler {
  constructor(
    @inject('AttributeRepository') private attributeRepository: IAttributeRepository
  ) {}

  async handle(command: DeleteMultipleAttributesCommand): Promise<{ deleted: number; failed: number }> {
    const { ids } = command.data;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('Se requiere un array de IDs válido');
    }

    // Eliminar múltiples atributos
    const result = await this.attributeRepository.deleteMultiple(ids);

    return result;
  }
}

