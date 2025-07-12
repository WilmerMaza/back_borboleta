import { SettingThemeModel, ISettingTheme } from '../database/models/SettingThemeModel';

export class SettingThemeRepository {
  async getThemeByName(name: string): Promise<ISettingTheme | null> {
    return SettingThemeModel.findOne({ name });
  }

  async getThemeBySlug(slug: string): Promise<ISettingTheme | null> {
    return SettingThemeModel.findOne({ slug });
  }

  async getAllThemes(): Promise<ISettingTheme[]> {
    return SettingThemeModel.find();
  }

  async saveTheme(themeData: { id: number; name: string; slug: string; content: any }): Promise<ISettingTheme> {
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

  async deleteTheme(name: string): Promise<boolean> {
    const result = await SettingThemeModel.deleteOne({ name });
    return result.deletedCount > 0;
  }
} 