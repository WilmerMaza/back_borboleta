import { injectable, inject } from 'tsyringe';
import { UpdateAttributeCommand } from '../../commands/attribute/UpdateAttributeCommand';
import { IAttributeRepository } from '../../../domain/repositories/IAttributeRepository';
import { IAttributeValueRepository } from '../../../domain/repositories/IAttributeValueRepository';
import { IAttribute } from '../../../domain/entities/Attribute';

@injectable()
export class UpdateAttributeHandler {
  constructor(
    @inject('AttributeRepository') private attributeRepository: IAttributeRepository,
    @inject('AttributeValueRepository') private attributeValueRepository: IAttributeValueRepository
  ) {}

  async handle(command: UpdateAttributeCommand): Promise<IAttribute> {
    const { id, update } = command.data;

    // Verificar que el atributo existe
    const existingAttribute = await this.attributeRepository.findById(id);
    if (!existingAttribute) {
      throw new Error(`Atributo con ID '${id}' no encontrado`);
    }

    // Validaciones
    if (update.name !== undefined) {
      if (update.name.trim().length === 0) {
        throw new Error('El nombre del atributo no puede estar vacío');
      }

      if (update.name.length > 255) {
        throw new Error('El nombre del atributo no puede exceder 255 caracteres');
      }

      // Validar que el nombre sea único (excepto el actual)
      if (update.name !== existingAttribute.name) {
        const attributeWithSameName = await this.attributeRepository.findByName(update.name);
        if (attributeWithSameName && attributeWithSameName.id !== id) {
          throw new Error('Ya existe un atributo con este nombre');
        }
      }
    }

    if (update.style !== undefined) {
      const validStyles = ['rectangle', 'circle', 'color', 'radio', 'image', 'dropdown'];
      if (!validStyles.includes(update.style)) {
        throw new Error(`El estilo debe ser uno de: ${validStyles.join(', ')}`);
      }
    }

    const finalStyle = update.style || existingAttribute.style;

    // Actualizar el atributo (si hay cambios en name, style o status)
    if (update.name || update.style !== undefined || update.status !== undefined) {
      await this.attributeRepository.update(id, {
        name: update.name,
        style: update.style,
        status: update.status,
      });
    }

    // Manejar los valores del atributo
    if (update.value && Array.isArray(update.value)) {
      // Obtener valores existentes
      const existingValues = await this.attributeValueRepository.findByAttributeId(id);
      const existingValueIds = new Set(existingValues.map(v => v.id).filter(Boolean) as number[]);

      // Procesar cada valor en el update
      const updatedValueIds = new Set<number>();

      for (const val of update.value) {
        // Validaciones
        if (!val.value || val.value.trim().length === 0) {
          throw new Error('El valor del atributo no puede estar vacío');
        }

        if (val.value.length > 255) {
          throw new Error('El valor del atributo no puede exceder 255 caracteres');
        }

        // Validar hex_color solo si style es "color"
        if (finalStyle === 'color' && val.hex_color) {
          const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
          if (!hexColorRegex.test(val.hex_color)) {
            throw new Error('El formato del color hexadecimal es inválido. Debe ser #RRGGBB');
          }
        }

        if (val.id) {
          // Actualizar valor existente
          updatedValueIds.add(val.id);
          await this.attributeValueRepository.update(val.id, {
            value: val.value,
            hex_color: finalStyle === 'color' ? val.hex_color : null,
          });
        } else {
          // Crear nuevo valor
          await this.attributeValueRepository.create({
            value: val.value,
            hex_color: finalStyle === 'color' ? val.hex_color : null,
            attribute_id: id,
            status: true,
          });
        }
      }

      // Eliminar valores que no están en el update
      const valuesToDelete = Array.from(existingValueIds).filter(id => !updatedValueIds.has(id));
      if (valuesToDelete.length > 0) {
        await this.attributeValueRepository.deleteMultiple(valuesToDelete);
      }
    }

    // Retornar el atributo actualizado con sus valores
    const updatedAttribute = await this.attributeRepository.findById(id);
    
    if (!updatedAttribute) {
      throw new Error('Error al actualizar el atributo');
    }

    return updatedAttribute;
  }
}

