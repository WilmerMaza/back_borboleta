import { Request, Response } from 'express';
import { SettingsRepository } from '../../infrastructure/repositories/SettingsRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';

export class SettingsController {
  private settingsRepository: SettingsRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
    this.categoryRepository = new CategoryRepository();
  }

  // GET /api/settings
  async getSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.settingsRepository.getSettings();
      if (!settings) {
        res.status(404).json({ success: false, message: 'Configuración no encontrada' });
        return;
      }
     
      const categories = await this.categoryRepository.findAll();
      const categoryIds = categories
        .map(cat => cat.numeric_id)
        .filter(id => typeof id === 'number');
      // Clonar y llenar category_ids
      const options = JSON.parse(JSON.stringify(settings.options));
      if (options.header) {
        options.header.category_ids = categoryIds;
      }
      res.json({ success: true, data: { id: settings.id, options } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error al obtener configuración' });
    }
  }


  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { options } = req.body;
      if (!options) {
        res.status(400).json({ success: false, message: 'El campo options es requerido' });
        return;
      }
      const settings = await this.settingsRepository.saveSettings(options);
      res.json({ success: true, data: { id: settings.id, options: settings.options } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error al guardar configuración' });
    }
  }
} 