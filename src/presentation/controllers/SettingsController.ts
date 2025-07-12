import { Request, Response } from 'express';
import { SettingsService } from '../../application/services/SettingsService';
import { ISettingsService } from '../../domain/interfaces/ISettingsService';

export class SettingsController {
  private settingsService: ISettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  // GET /api/settings
  async getSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.settingsService.getSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      if (error.message === 'Configuración no encontrada') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message || 'Error al obtener configuración' });
      }
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { options } = req.body;
      const settings = await this.settingsService.updateSettings(options);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      if (error.message === 'El campo options es requerido') {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message || 'Error al guardar configuración' });
      }
    }
  }
} 