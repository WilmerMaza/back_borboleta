import mongoose, { Schema, Document } from "mongoose";
import { IAttributeValue } from "../../../domain/entities/AttributeValue";
const AutoIncrement = require("mongoose-sequence")(mongoose);

type IAttributeValueWithoutId = Omit<IAttributeValue, "id">;

export interface IAttributeValueModel extends IAttributeValueWithoutId, Document {
  id: number;
}

const attributeValueSchema = new Schema<IAttributeValueModel>(
  {
    value: { type: String, required: true, trim: true, maxlength: 255 },
    hex_color: { 
      type: String, 
      default: null, 
      validate: {
        validator: function(this: any, value: string | null) {
          // Permitir null o string vacío, o validar formato hexadecimal
          if (!value || value === '') return true;
          return /^#[0-9A-Fa-f]{6}$/.test(value);
        },
        message: 'El formato del color hexadecimal es inválido. Debe ser #RRGGBB'
      }
    },
    slug: { type: String },
    attribute_id: { type: Number, required: true, ref: "Attribute" },
    status: { type: Boolean, default: true },
    created_by_id: { type: Number },
    deleted_at: { type: Date, default: null },
    id: { type: Number, unique: true, sparse: true }, // autoincremental
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Plugin de autoincremento
attributeValueSchema.plugin(AutoIncrement, {
  inc_field: "id",
  id: "attribute_value_id_counter",
});

export default mongoose.model<IAttributeValueModel>(
  "AttributeValue",
  attributeValueSchema
);

