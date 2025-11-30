import { injectable, inject } from 'tsyringe';
import { CreateAttributeCommand } from '../../commands/attribute/CreateAttributeCommand';
import { IAttributeRepository } from '../../../domain/repositories/IAttributeRepository';
import { IAttributeValueRepository } from '../../../domain/repositories/IAttributeValueRepository';
import { IAttribute } from '../../../domain/entities/Attribute';

@injectable()
export class CreateAttributeHandler {
  constructor(
    @inject('AttributeRepository') private attributeRepository: IAttributeRepository,
    @inject('AttributeValueRepository') private attributeValueRepository: IAttributeValueRepository
  ) {}

  async handle(command: CreateAttributeCommand, createdById?: number): Promise<IAttribute> {
    const { name, style, status, value } = command.data;

    // Validaciones
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del atributo es requerido');
    }

    if (name.length > 255) {
      throw new Error('El nombre del atributo no puede exceder 255 caracteres');
    }

    if (!style) {
      throw new Error('El estilo del atributo es requerido');
    }

    const validStyles = ['rectangle', 'circle', 'color', 'radio', 'image', 'dropdown'];
    if (!validStyles.includes(style)) {
      throw new Error(`El estilo debe ser uno de: ${validStyles.join(', ')}`);
    }

    if (!value || !Array.isArray(value) || value.length === 0) {
      throw new Error('Se requiere al menos un valor para el atributo');
    }

    // Validar que el nombre sea único
    const existingAttribute = await this.attributeRepository.findByName(name);
    if (existingAttribute) {
      throw new Error('Ya existe un atributo con este nombre');
    }

    // Crear el atributo
    const attribute = await this.attributeRepository.create({
      name,
      style,
      status: status !== undefined ? status : true,
      created_by_id: createdById,
    });

    if (!attribute.id) {
      throw new Error('Error al crear el atributo');
    }

    // Crear los valores del atributo
    const attributeValues = [];
    for (const val of value) {
      if (!val.value || val.value.trim().length === 0) {
        throw new Error('El valor del atributo no puede estar vacío');
      }

      if (val.value.length > 255) {
        throw new Error('El valor del atributo no puede exceder 255 caracteres');
      }

      // Validar hex_color solo si style es "color"
      if (style === 'color' && val.hex_color) {
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
        if (!hexColorRegex.test(val.hex_color)) {
          throw new Error('El formato del color hexadecimal es inválido. Debe ser #RRGGBB');
        }
      }

      const attributeValue = await this.attributeValueRepository.create({
        value: val.value,
        hex_color: style === 'color' ? val.hex_color : null,
        attribute_id: attribute.id!,
        status: true,
        created_by_id: createdById,
      });

      attributeValues.push(attributeValue);
    }

    // Retornar el atributo con sus valores
    const attributeWithValues = await this.attributeRepository.findById(attribute.id!);
    
    return attributeWithValues || attribute;
  }
}

