import { Request, Response } from 'express';
import { SettingThemeService } from '../../application/services/SettingThemeService';
import { ISettingThemeService } from '../../domain/interfaces/ISettingThemeService';

export class SettingThemeController {
  private settingThemeService: ISettingThemeService;

  constructor() {
    this.settingThemeService = new SettingThemeService();
  }

  // GET /api/setting-theme/:name
  async getThemeByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const theme = await this.settingThemeService.getThemeByName(name);
      res.json({ success: true, data: theme });
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message || 'Error al obtener el tema' });
      }
    }
  }

  // GET /api/setting-theme/slug/:slug
  async getThemeBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const theme = await this.settingThemeService.getThemeBySlug(slug);
      res.json({ success: true, data: theme });
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message || 'Error al obtener el tema' });
      }
    }
  }

  // GET /api/setting-theme
  async getAllThemes(_req: Request, res: Response): Promise<void> {
    try {
      const themes = await this.settingThemeService.getAllThemes();
      res.json({ success: true, data: themes });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error al obtener los temas' });
    }
  }

  // POST /api/setting-theme
  async saveTheme(req: Request, res: Response): Promise<void> {
    try {
      const { name, slug, content } = req.body;
      
      if (!name || !slug || !content) {
        res.status(400).json({ success: false, message: 'Los campos name, slug y content son requeridos' });
        return;
      }

      const theme = await this.settingThemeService.saveTheme({ name, slug, content });
      res.json({ success: true, data: theme });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error al guardar el tema' });
    }
  }

  // DELETE /api/setting-theme/:name
  async deleteTheme(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const deleted = await this.settingThemeService.deleteTheme(name);
      
      if (deleted) {
        res.json({ success: true, message: 'Tema eliminado correctamente' });
      } else {
        res.status(404).json({ success: false, message: 'Tema no encontrado' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error al eliminar el tema' });
    }
  }
} 