export interface ISettingThemeResponse {
  id: number;
  name: string;
  slug: string;
  content: any;
}

export interface ISettingThemeRequest {
  name: string;
  slug: string;
  content: any;
}

export interface ISettingThemeListResponse {
  themes: ISettingThemeResponse[];
} 