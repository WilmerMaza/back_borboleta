import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "../../../domain/entities/Category";
const AutoIncrement = require("mongoose-sequence")(mongoose);

type ICategoryWithoutId = Omit<ICategory, "id">;

export interface ICategoryModel extends ICategoryWithoutId, Document {
  id: number;
  populateSubcategories: () => Promise<ICategoryModel>;
}

const categorySchema = new Schema<ICategoryModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String, trim: true },
    type: { type: String, default: "product" },
    parent_id: { type: String, ref: "Category", default: null },
    category_image_id: { type: Number, ref: "Attachment" },
    category_icon_id: { type: Number, ref: "Attachment" },
    category_meta_image_id: { type: Number, ref: "Attachment" },
    commission_rate: {
      type: Number,
      min: [0, "La comisión no puede ser negativa"],
      max: [100, "La comisión no puede ser mayor al 100%"],
    },
    products_count: { type: Number, default: 0 },
    meta_title: { type: String, trim: true },
    meta_description: { type: String, trim: true },
    status: { type: Number, default: 1 },
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

// Virtual para subcategorías
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "id", 
  foreignField: "parent_id",
});

categorySchema.methods.populateSubcategories = async function () {
  return await this.populate("subcategories");
};

// Plugin de autoincremento
categorySchema.plugin(AutoIncrement, {
  inc_field: "id",
  id: "category_id_counter",
});

export default mongoose.model<ICategoryModel>("Category", categorySchema);
