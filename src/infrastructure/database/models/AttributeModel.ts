import mongoose, { Schema, Document } from "mongoose";
import { IAttribute } from "../../../domain/entities/Attribute";
const AutoIncrement = require("mongoose-sequence")(mongoose);

type IAttributeWithoutId = Omit<IAttribute, "id">;

export interface IAttributeModel extends IAttributeWithoutId, Document {
  id: number;
}

const attributeSchema = new Schema<IAttributeModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    slug: { type: String, unique: true, sparse: true },
    style: {
      type: String,
      required: true,
      enum: ["rectangle", "circle", "color", "radio", "image", "dropdown"],
    },
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

// Virtual para attribute_values
attributeSchema.virtual("attribute_values", {
  ref: "AttributeValue",
  localField: "id",
  foreignField: "attribute_id",
  match: { deleted_at: null }, // Solo incluir valores no eliminados
});

// Plugin de autoincremento
attributeSchema.plugin(AutoIncrement, {
  inc_field: "id",
  id: "attribute_id_counter",
});

export default mongoose.model<IAttributeModel>("Attribute", attributeSchema);

