import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  id: number;
  options?: any;
  values?: any;
}

const SettingsSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    default: 1,
  },
  name: { type: String, required: true, unique: true },
  options: {
    type: Schema.Types.Mixed,
    required: true,
  },
  values: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

export const SettingsModel = mongoose.model<ISettings>(
  "Settings",
  SettingsSchema
);
