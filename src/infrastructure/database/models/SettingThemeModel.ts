import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingTheme extends Document {
  id: number;
  name: string;
  slug: string;
  content: any;
}

const SettingThemeSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: Schema.Types.Mixed,
    required: true
  }
});

export const SettingThemeModel = mongoose.model<ISettingTheme>('SettingTheme', SettingThemeSchema); 