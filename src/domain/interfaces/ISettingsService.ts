import { ISettingsResponse } from './ISettingsResponse';

export interface ISettingsService {
  getSettings(): Promise<ISettingsResponse>;
  updateSettings(options: any): Promise<ISettingsResponse>;
} 