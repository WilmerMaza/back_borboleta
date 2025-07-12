import { SettingsRepository } from '../../infrastructure/repositories/SettingsRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';

import { ISettingsService } from '../../domain/interfaces/ISettingsService';
import { ISettingsResponse } from '../../domain/interfaces/ISettingsResponse';

export class SettingsService implements ISettingsService {
  private settingsRepository: SettingsRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async getSettings(): Promise<ISettingsResponse> {
    const settings = await this.settingsRepository.getSettings();
    if (!settings) {
      throw new Error('Configuración no encontrada');
    }

    const categories = await this.categoryRepository.findAll();
    const categoryIds = categories
      .map(cat => cat.numeric_id)
      .filter(id => typeof id === 'number');

    /
    const options = JSON.parse(JSON.stringify(settings.options));
    if (options.header) {
      options.header.category_ids = categoryIds;
    }

    return { id: settings.id, options };
  }

  async updateSettings(options: any): Promise<ISettingsResponse> {
    if (!options) {
      throw new Error('El campo options es requerido');
    }

    const settings = await this.settingsRepository.saveSettings(options);
    return { id: settings.id, options: settings.options };
  }
} 