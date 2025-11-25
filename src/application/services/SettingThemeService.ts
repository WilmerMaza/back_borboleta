import { SettingThemeRepository } from '../../infrastructure/repositories/SettingThemeRepository';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { ISettingThemeService } from '../../domain/interfaces/ISettingThemeService';
import { ISettingThemeResponse, ISettingThemeListResponse } from '../../domain/interfaces/ISettingThemeResponse';
import { injectable, inject } from 'tsyringe';

@injectable()
export class SettingThemeService implements ISettingThemeService {
  private settingThemeRepository: SettingThemeRepository;

  constructor(
    @inject('ProductRepository') private productRepository: ProductRepository,
    @inject('CategoryRepository') private categoryRepository: CategoryRepository
  ) {
    this.settingThemeRepository = new SettingThemeRepository();
  }

  private async fillProductsIds(content: any): Promise<any> {
    const products = await this.productRepository.findAll({ skip: 0, limit: 1000 });
    const productIds = products
      .map(prod => prod.id)
      .filter(id => typeof id === 'number');

    const options = JSON.parse(JSON.stringify(content));
    if (options && options.products_list) {
      options.products_list.product_ids = productIds;
    }
    return options;
  }

  private async fillCategoriesIds(content: any): Promise<any> {
    // Obtener todas las categorías desde el repositorio
    const categories = await this.categoryRepository.findAll();
    const categoryIds = categories
      .map(cat => cat.id)
      .filter(id => typeof id === 'number');

    const options = JSON.parse(JSON.stringify(content));
    
    // Actualizar IDs de categorías en diferentes secciones del contenido
    if (options && options.categories_list) {
      options.categories_list.category_ids = categoryIds;
    }
    
    // También actualizar en secciones específicas como navigation, footer, etc.
    if (options && options.navigation && options.navigation.categories) {
      options.navigation.categories = categoryIds;
    }
    
    if (options && options.footer && options.footer.categories) {
      options.footer.categories = categoryIds;
    }

    console.log("📝 Categorías actualizadas en setting:", categoryIds);
    return options;
  }

  private async fillIds(content: any): Promise<any> {
    // Actualizar tanto productos como categorías
    let updatedContent = await this.fillProductsIds(content);
    updatedContent = await this.fillCategoriesIds(updatedContent);
    return updatedContent;
  }

  async getThemeByName(name: string): Promise<ISettingThemeResponse> {
    const theme = await this.settingThemeRepository.getThemeByName(name);
    if (!theme) {
      throw new Error(`Tema '${name}' no encontrado`);
    }
    const content = await this.fillIds(theme.content);
    return {
      id: theme.id,
      name: theme.name || '',
      slug: theme.slug,
      content
    };
  }

  async getThemeBySlug(slug: string): Promise<ISettingThemeResponse> {
    const theme = await this.settingThemeRepository.getThemeBySlug(slug);
    if (!theme) {
      throw new Error(`Tema con slug '${slug}' no encontrado`);
    }
    const content = await this.fillIds(theme.content);
    return {
      id: theme.id,
      name: theme.name || '',
      slug: theme.slug,
      content
    };
  }

  async getAllThemes(): Promise<ISettingThemeListResponse> {
    const themes = await this.settingThemeRepository.getAllThemes();
    const populatedThemes = await Promise.all(
      themes.map(async (theme) => {
        const content = await this.fillIds(theme.content);
        return {
          id: theme.id,
          name: theme.name,
          slug: theme.slug,
          content
        };
      })
    );
    return { themes: populatedThemes };
  }

  async saveTheme(themeData: any): Promise<ISettingThemeResponse> {
    const theme = await this.settingThemeRepository.saveTheme({
      id: Date.now(),
      ...themeData
    });
    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      content: theme.content
    };
  }

  // async updateTheme(data: { name: string; content: any }): Promise<ISettingThemeResponse> {
  //   const { name, content } = data;
  //   const theme = await this.settingThemeRepository.updateTheme(name, content);
  //   if (!theme) {
  //     throw new Error(`Tema '${name}' no encontrado`);
  //   }
  //   return {
  //     id: theme.id,
  //     name: theme.name || '',
  //     slug: theme.slug,
  //     content: theme.content
  //   };
  // }

  async updateThemeBySlug(data: { slug: string; name: string; content: any }): Promise<ISettingThemeResponse | null> {
    const { slug, name, content } = data;
    const theme = await this.settingThemeRepository.updateThemeBySlug(slug, name, content);
    if (!theme) {
      return null;
    }
    return {
      id: theme.id,
      name: theme.name || name,
      slug: theme.slug,
      content: theme.content
    };
  }

  async deleteTheme(name: string): Promise<boolean> {
    return await this.settingThemeRepository.deleteTheme(name);
  }
} 