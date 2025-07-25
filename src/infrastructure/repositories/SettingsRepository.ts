import { SettingsModel, ISettings } from '../database/models/SettingsModel';

export class SettingsRepository {
  async getSettings(name:String): Promise<ISettings | null> {
    return SettingsModel.findOne({ name });
  }

  async saveSettings(options: any): Promise<ISettings> {
    let settings = await SettingsModel.findOne({ id: 1 });
    if (!settings) {
      settings = new SettingsModel({ id: 1, options });
    } else {
      settings.options = options;
    }
    await settings.save();
    return settings;
  }
} 