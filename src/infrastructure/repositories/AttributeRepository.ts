import { injectable } from "tsyringe";
import AttributeModel from "../database/models/AttributeModel";
import AttributeValueModel from "../database/models/AttributeValueModel";
import { IAttribute } from "../../domain/entities/Attribute";
import { IAttributeRepository } from "../../domain/repositories/IAttributeRepository";

@injectable()
export class AttributeRepository implements IAttributeRepository {
  
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

  async create(attribute: Partial<IAttribute>): Promise<IAttribute> {
    // Si no se proporciona slug, generar uno automáticamente desde el name
    if (!attribute.slug && attribute.name) {
      attribute.slug = this.generateSlug(attribute.name);
    }

    const attributeDoc = new AttributeModel(attribute);
    const savedAttribute = await attributeDoc.save();
    
    // Populate attribute_values
    await savedAttribute.populate('attribute_values');
    
    return savedAttribute.toObject();
  }

  async findAll(options?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: boolean;
    style?: string;
  }): Promise<{ data: IAttribute[]; total: number; current_page: number; per_page: number; last_page: number }> {
    const page = options?.page || 1;
    const per_page = options?.per_page || 10;
    const skip = (page - 1) * per_page;

    // Construir filtros
    const filters: any = { deleted_at: null };
    
    if (options?.status !== undefined) {
      filters.status = options.status;
    }
    
    if (options?.search) {
      filters.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { slug: { $regex: options.search, $options: 'i' } }
      ];
    }
    
    if (options?.style) {
      filters.style = options.style;
    }

    // Obtener total
    const total = await AttributeModel.countDocuments(filters);
    
    // Obtener atributos con paginación
    const attributes = await AttributeModel.find(filters)
      .skip(skip)
      .limit(per_page)
      .populate('attribute_values')
      .sort({ created_at: -1 });

    const last_page = Math.ceil(total / per_page);

    return {
      data: attributes.map(attr => attr.toObject()),
      total,
      current_page: page,
      per_page,
      last_page
    };
  }

  async findById(id: number): Promise<IAttribute | null> {
    const attribute = await AttributeModel.findOne({ id, deleted_at: null }).populate('attribute_values');
    return attribute ? attribute.toObject() : null;
  }

  async findBySlug(slug: string): Promise<IAttribute | null> {
    const attribute = await AttributeModel.findOne({ slug, deleted_at: null }).populate('attribute_values');
    return attribute ? attribute.toObject() : null;
  }

  async findByName(name: string): Promise<IAttribute | null> {
    const attribute = await AttributeModel.findOne({ name, deleted_at: null });
    return attribute ? attribute.toObject() : null;
  }

  async update(id: number, attribute: Partial<IAttribute>): Promise<IAttribute | null> {
    // Si se actualiza el name y no se proporciona slug, generar uno automáticamente
    if (attribute.name && !attribute.slug) {
      attribute.slug = this.generateSlug(attribute.name);
    }

    const updated = await AttributeModel.findOneAndUpdate(
      { id, deleted_at: null },
      attribute,
      { new: true }
    ).populate('attribute_values');

    return updated ? updated.toObject() : null;
  }

  async updateStatus(id: number, status: boolean): Promise<IAttribute | null> {
    const updated = await AttributeModel.findOneAndUpdate(
      { id, deleted_at: null },
      { status },
      { new: true }
    ).populate('attribute_values');

    return updated ? updated.toObject() : null;
  }

  async delete(id: number): Promise<boolean> {
    // Soft delete
    const result = await AttributeModel.findOneAndUpdate(
      { id },
      { deleted_at: new Date() },
      { new: true }
    );
    
    // También hacer soft delete de los attribute_values relacionados
    if (result) {
      await AttributeValueModel.updateMany(
        { attribute_id: id },
        { deleted_at: new Date() }
      );
    }
    
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
}

