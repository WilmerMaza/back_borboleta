import { SettingThemeRepository } from '../../infrastructure/repositories/SettingThemeRepository';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';
import { ISettingThemeService } from '../../domain/interfaces/ISettingThemeService';
import { ISettingThemeResponse, ISettingThemeListResponse } from '../../domain/interfaces/ISettingThemeResponse';

export class SettingThemeService implements ISettingThemeService {
  private settingThemeRepository: SettingThemeRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.settingThemeRepository = new SettingThemeRepository();
    this.productRepository = new ProductRepository();
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

  async getThemeByName(name: string): Promise<ISettingThemeResponse> {
    const theme = await this.settingThemeRepository.getThemeByName(name);
    if (!theme) {
      throw new Error(`Tema '${name}' no encontrado`);
    }
    const content = await this.fillProductsIds(theme.content);
    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      content
    };
  }

  async getThemeBySlug(slug: string): Promise<ISettingThemeResponse> {
    const theme = await this.settingThemeRepository.getThemeBySlug(slug);
    if (!theme) {
      throw new Error(`Tema con slug '${slug}' no encontrado`);
    }
    const content = await this.fillProductsIds(theme.content);
    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      content
    };
  }

  async getAllThemes(): Promise<ISettingThemeListResponse> {
    const themes = await this.settingThemeRepository.getAllThemes();
    const populatedThemes = await Promise.all(
      themes.map(async (theme) => {
        const content = await this.fillProductsIds(theme.content);
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

  async deleteTheme(name: string): Promise<boolean> {
    return await this.settingThemeRepository.deleteTheme(name);
  }
} 