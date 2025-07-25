import { ISettingsResponse } from './ISettingsResponse';
import { Request } from "express";

export interface ISettingsService {
  getSettings(request:Request): Promise<ISettingsResponse>;
  updateSettings(options: any): Promise<ISettingsResponse>;
} 