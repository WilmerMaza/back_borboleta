import { Request, Response } from 'express';
import { ISettingThemeService } from '../../domain/interfaces/ISettingThemeService';
import { injectable, inject } from 'tsyringe';

@injectable()
export class SettingThemeController {
  constructor(
    @inject('ISettingThemeService') private settingThemeService: ISettingThemeService
  ) {}

  // GET /api/setting-theme/:name
  async getThemeByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const theme = await this.settingThemeService.getThemeByName(name);
      res.json({  ...theme });
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
      res.json({  ...theme, success: true });
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

  // PUT /api/setting-theme/:slug
  async updateTheme(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const { name, content } = req.body;
      
      console.log('📥 Actualizando tema:', slug);
      console.log('📦 Name recibido:', name);
      console.log('📄 Content recibido:', content ? 'Sí' : 'No');
      
      if (!name) {
        res.status(400).json({
          success: false,
          message: 'El campo "name" es requerido'
        });
        return;
      }
      
      if (!content) {
        res.status(400).json({
          success: false,
          message: 'El campo "content" es requerido'
        });
        return;
      }

      const theme = await this.settingThemeService.updateThemeBySlug({ slug, name, content });
      
      if (!theme) {
        res.status(404).json({
          success: false,
          message: `Tema con slug "${slug}" no encontrado`
        });
        return;
      }

      console.log('✅ Tema actualizado exitosamente');
      
      res.json({
        success: true,
        message: 'Tema actualizado exitosamente',
        data: theme
      });
    } catch (error: any) {
      console.error('❌ Error al actualizar tema:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar el tema'
      });
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