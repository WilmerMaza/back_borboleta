import { injectable } from "tsyringe";
import CategoryModel from "../database/models/CategoryModel";
import { ICategory } from "../../domain/entities/Category";

@injectable()
export class CategoryRepository {
  
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

  async create(categoryData: ICategory): Promise<ICategory> {
    // Si no se proporciona slug, generar uno automáticamente desde el name
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = this.generateSlug(categoryData.name);
      console.log("📝 Slug generado automáticamente:", categoryData.slug, "para categoría:", categoryData.name);
    }

    const category = new CategoryModel(categoryData);
    return await category.save();
  }

  async findById(id: number): Promise<ICategory | null> {
    return await CategoryModel.findById(id).populate("subcategories");
  }

  async findByAutoIncrementId(id: number): Promise<ICategory | null> {
    return await CategoryModel.findOne({ id }).populate("subcategories");
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ slug }).populate("subcategories");
  }

  async findAll(): Promise<ICategory[]> {
    try {
      const categories = await CategoryModel.find({ parent_id: null }).populate(
        "subcategories"
      );

      // Transformar _id a id para compatibilidad con el frontend
      return categories.map((category) => {
        const categoryObj = category.toObject();
        return {
          ...categoryObj,
        };
      });
    } catch (error) {
      console.error("❌ Error en CategoryRepository.findAll:", error);
      throw new Error("Error al obtener categorías de la base de datos");
    }
  }

  async findSubcategories(parentId: string): Promise<ICategory[]> {
    return await CategoryModel.find({ parent_id: parentId });
  }

  async update(
    id: string,
    categoryData: Partial<ICategory>
  ): Promise<ICategory | null> {
    // Si se actualiza el name y no se proporciona slug, generar uno automáticamente
    if (categoryData.name && !categoryData.slug) {
      categoryData.slug = this.generateSlug(categoryData.name);
      console.log("📝 Slug regenerado automáticamente:", categoryData.slug, "para categoría:", categoryData.name);
    }

    return await CategoryModel.findByIdAndUpdate(id, categoryData, {
      new: true,
    });
  }

  async updateByAutoIncrementId(id: number, categoryData: Partial<ICategory>): Promise<ICategory | null> {
    // Si se actualiza el name y no se proporciona slug, generar uno automáticamente
    if (categoryData.name && !categoryData.slug) {
      categoryData.slug = this.generateSlug(categoryData.name);
      console.log("📝 Slug regenerado automáticamente:", categoryData.slug, "para categoría:", categoryData.name);
    }

    return await CategoryModel.findOneAndUpdate({ id: id }, categoryData, {
      new: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return result !== null;
  }

  async deleteByAutoIncrementId(id: number): Promise<boolean> {
    const result = await CategoryModel.findOneAndDelete({ id: id });
    return result !== null;
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await CategoryModel.findOne({ name });
  }
}
