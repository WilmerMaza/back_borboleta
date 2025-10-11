import { SettingThemeModel, ISettingTheme } from '../database/models/SettingThemeModel';

export class SettingThemeRepository {
  async getThemeByName(slug: string): Promise<ISettingTheme | null> {
    return SettingThemeModel.findOne({ slug });
  }

  async getThemeBySlug(slug: string): Promise<ISettingTheme | null> {
    return SettingThemeModel.findOne({ slug });
  }

  async getAllThemes(): Promise<ISettingTheme[]> {
    return SettingThemeModel.find();
  }

  async saveTheme(themeData: {
    id: number;
    name: string;
    slug: string;
    content: any;
  }): Promise<ISettingTheme> {
    let theme = await SettingThemeModel.findOne({ name: themeData.name });
    if (!theme) {
      theme = new SettingThemeModel(themeData);
    } else {
      theme.content = themeData.content;
      theme.slug = themeData.slug;
    }
    await theme.save();
    return theme;
  }

  async updateThemeBySlug(slug: string, name: string, content: any): Promise<ISettingTheme | null> {
    console.log('🔍 Buscando tema con slug:', slug);
    
    const updatedTheme = await SettingThemeModel.findOneAndUpdate(
      { slug: slug },
      { 
        name: name,
        slug: slug,
        content: content
      },
      { 
        new: true,
        runValidators: true,
        upsert: false
      }
    );
    
    if (!updatedTheme) {
      console.log('❌ Tema no encontrado con slug:', slug);
      return null;
    }
    
    console.log('✅ Tema actualizado exitosamente');
    return updatedTheme;
  }

  async deleteTheme(name: string): Promise<boolean> {
    const result = await SettingThemeModel.deleteOne({ name });
    return result.deletedCount > 0;
  }
} 