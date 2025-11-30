import { injectable } from "tsyringe";
import AttributeValueModel from "../database/models/AttributeValueModel";
import { IAttributeValue } from "../../domain/entities/AttributeValue";
import { IAttributeValueRepository } from "../../domain/repositories/IAttributeValueRepository";

@injectable()
export class AttributeValueRepository implements IAttributeValueRepository {
  
  /**
   * Genera un slug a partir de un texto
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
  }

  async create(attributeValue: Partial<IAttributeValue>): Promise<IAttributeValue> {
    // Si no se proporciona slug, generar uno automáticamente desde el value
    if (!attributeValue.slug && attributeValue.value) {
      attributeValue.slug = this.generateSlug(attributeValue.value);
    }

    const attributeValueDoc = new AttributeValueModel(attributeValue);
    const saved = await attributeValueDoc.save();
    return saved.toObject();
  }

  async findAll(options?: {
    attribute_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<{ data: IAttributeValue[]; total: number }> {
    const page = options?.page || 1;
    const per_page = options?.per_page || 10;
    const skip = (page - 1) * per_page;

    // Construir filtros
    const filters: any = { deleted_at: null };
    
    if (options?.attribute_id) {
      filters.attribute_id = options.attribute_id;
    }

    // Obtener total
    const total = await AttributeValueModel.countDocuments(filters);
    
    // Obtener valores con paginación
    const attributeValues = await AttributeValueModel.find(filters)
      .skip(skip)
      .limit(per_page)
      .sort({ created_at: -1 });

    return {
      data: attributeValues.map(av => av.toObject()),
      total
    };
  }

  async findById(id: number): Promise<IAttributeValue | null> {
    const attributeValue = await AttributeValueModel.findOne({ id, deleted_at: null });
    return attributeValue ? attributeValue.toObject() : null;
  }

  async findByAttributeId(attributeId: number): Promise<IAttributeValue[]> {
    const attributeValues = await AttributeValueModel.find({
      attribute_id: attributeId,
      deleted_at: null
    }).sort({ created_at: -1 });
    
    return attributeValues.map(av => av.toObject());
  }

  async update(id: number, attributeValue: Partial<IAttributeValue>): Promise<IAttributeValue | null> {
    // Si se actualiza el value y no se proporciona slug, generar uno automáticamente
    if (attributeValue.value && !attributeValue.slug) {
      attributeValue.slug = this.generateSlug(attributeValue.value);
    }

    const updated = await AttributeValueModel.findOneAndUpdate(
      { id, deleted_at: null },
      attributeValue,
      { new: true }
    );

    return updated ? updated.toObject() : null;
  }

  async delete(id: number): Promise<boolean> {
    // Soft delete
    const result = await AttributeValueModel.findOneAndUpdate(
      { id },
      { deleted_at: new Date() },
      { new: true }
    );
    
    return result !== null;
  }

  async deleteMultiple(ids: number[]): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.delete(id);
        if (result) {
          deleted++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { deleted, failed };
  }

  async deleteByAttributeId(attributeId: number): Promise<boolean> {
    // Soft delete de todos los valores de un atributo
    const result = await AttributeValueModel.updateMany(
      { attribute_id: attributeId },
      { deleted_at: new Date() }
    );
    
    return result.modifiedCount > 0;
  }
}

