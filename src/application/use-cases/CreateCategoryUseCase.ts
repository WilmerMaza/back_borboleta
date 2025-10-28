import { injectable, inject } from "tsyringe";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository";
import { ICategory } from "../../domain/entities/Category";
import { SettingThemeRepository } from "../../infrastructure/repositories/SettingThemeRepository";

@injectable()
export class CreateCategoryUseCase {
  constructor(
    @inject("CategoryRepository")
    private categoryRepository: CategoryRepository,
    private settingThemeRepository: SettingThemeRepository
  ) {}

  async execute(categoryData: ICategory): Promise<ICategory> {
    console.log("📝 CreateCategoryUseCase - Datos recibidos:", categoryData);
    
    // Validar que el nombre sea único
    const existingCategory = await this.categoryRepository.findByName(
      categoryData.name
    );
    if (existingCategory) {
      throw new Error("Ya existe una categoría con este nombre");
    }

    // Validar que si tiene parent_id, la categoría padre exista
    if (categoryData.parent_id) {
      const parentCategory =
        await this.categoryRepository.findByAutoIncrementId(
          categoryData.parent_id
        );
      if (!parentCategory) {
        throw new Error("La categoría padre no existe");
      }

      // Convertir parent_id a string para guardar en la base de datos
      categoryData.parent_id = categoryData.parent_id.toString();
    }

    // Validar comisión si se proporciona
    if (categoryData.commission_rate !== undefined) {
      if (
        categoryData.commission_rate < 0 ||
        categoryData.commission_rate > 100
      ) {
        throw new Error("La comisión debe estar entre 0 y 100");
      }
    }

    // Crear la categoría
    console.log("📝 CreateCategoryUseCase - Creando categoría con datos:", {
      ...categoryData,
      status: categoryData.status ?? 1,
    });
    
    const category = await this.categoryRepository.create({
      ...categoryData,
      status: categoryData.status ?? 1,
    });

    console.log("📝 CreateCategoryUseCase - Categoría creada:", category);
    
    // Actualizar automáticamente el setting con las nuevas categorías
    try {
      console.log("🔄 Actualizando setting con nuevas categorías...");
      await this.updateSettingCategories();
      console.log("✅ Setting actualizado correctamente");
    } catch (error) {
      console.error("❌ Error actualizando setting:", error);
      // No lanzar error para no afectar la creación de la categoría
    }
    
    return category;
  }

  private async updateSettingCategories(): Promise<void> {
    try {
      // Obtener todas las categorías actualizadas
      const categories = await this.categoryRepository.findAll();
      const categoryIds = categories
        .map(cat => cat.id)
        .filter(id => typeof id === 'number');

      console.log("📝 IDs de categorías para actualizar en setting:", categoryIds);

      // Obtener el setting actual
      const theme = await this.settingThemeRepository.getThemeBySlug('themeOptions');
      
      if (!theme) {
        console.warn("⚠️ Tema 'themeOptions' no encontrado");
        return;
      }

      // Actualizar los category_ids en las secciones relevantes
      if (theme.content.category_product) {
        theme.content.category_product.category_ids = categoryIds;
      }
      
      // Actualizar el setting usando updateThemeBySlug
      const updatedTheme = await this.settingThemeRepository.updateThemeBySlug(
        'themeOptions',
        'themeOptions',
        theme.content
      );

      if (!updatedTheme) {
        throw new Error("No se pudo actualizar el tema");
      }

      console.log("✅ Setting actualizado con category_ids:", categoryIds);
    } catch (error) {
      console.error("❌ Error en updateSettingCategories:", error);
      throw error;
    }
  }
}
