import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  id: number;
  options: any;
}

const SettingsSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    default: 1
  },
  options: {
    type: Schema.Types.Mixed,
    required: true
  }
});

export const SettingsModel = mongoose.model<ISettings>('Settings', SettingsSchema); 