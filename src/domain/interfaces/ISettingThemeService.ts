import { ISettingThemeResponse, ISettingThemeRequest, ISettingThemeListResponse } from './ISettingThemeResponse';

export interface ISettingThemeService {
  getThemeByName(name: string): Promise<ISettingThemeResponse>;
  getThemeBySlug(slug: string): Promise<ISettingThemeResponse>;
  getAllThemes(): Promise<ISettingThemeListResponse>;
  saveTheme(themeData: ISettingThemeRequest): Promise<ISettingThemeResponse>;
  deleteTheme(name: string): Promise<boolean>;
} 