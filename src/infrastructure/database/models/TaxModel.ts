import mongoose, { Schema, Document } from "mongoose";
import { ITax } from "../../../domain/entities/Tax";
const AutoIncrement = require("mongoose-sequence")(mongoose);

type ITaxWithoutId = Omit<ITax, "id">;

export interface ITaxModel extends ITaxWithoutId, Document {
  id: number;
}

const taxSchema = new Schema<ITaxModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    rate: { type: Number, required: true, min: 0, max: 100 },
    country_id: { type: Number },
    state_id: { type: Number },
    pincode: { type: Number },
    city: { type: String, trim: true },
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
taxSchema.plugin(AutoIncrement, {
  inc_field: "id",
  id: "tax_id_counter",
});

export default mongoose.model<ITaxModel>("Tax", taxSchema);
