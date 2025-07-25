import { SettingsRepository } from "../../infrastructure/repositories/SettingsRepository";
import { CategoryRepository } from "../../infrastructure/repositories/CategoryRepository";
import { Request } from "express";
import { ISettingsService } from "../../domain/interfaces/ISettingsService";
import { ISettingsResponse } from "../../domain/interfaces/ISettingsResponse";

export class SettingsService implements ISettingsService {
  private settingsRepository: SettingsRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async getSettings(request: Request): Promise<ISettingsResponse> {
    const setting = request.query.name; // Asumiendo que el usuario está autenticado y su ID está en el request
    let settings: any = await this.settingsRepository.getSettings(
      setting as String
    );
    if (!settings) {
      throw new Error("Configuración no encontrada");
    }

    settings = settings.toObject();

    if (setting === "themeOptions") {
      const categories = await this.categoryRepository.findAll();
      const categoryIds = categories
        .map((cat) => cat.id)
        .filter((id) => typeof id === "number");

      const options = JSON.parse(JSON.stringify(settings.options));
      if (options.header) {
        options.header.category_ids = categoryIds;
      }

      settings = {
        ...settings,
        options: options,
      };
    }

    return settings;
  }

  async updateSettings(options: any): Promise<ISettingsResponse> {
    if (!options) {
      throw new Error("El campo options es requerido");
    }

    const settings = await this.settingsRepository.saveSettings(options);
    return { id: settings.id, options: settings.options };
  }
}
