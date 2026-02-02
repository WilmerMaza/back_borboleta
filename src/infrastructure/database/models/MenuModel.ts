import mongoose, { Schema, Document } from "mongoose";
import { IMenu } from "../../../domain/entities/Menu";
const AutoIncrement = require("mongoose-sequence")(mongoose);

type IMenuWithoutId = Omit<IMenu, "id" | "child" | "banner_image" | "item_image">;

export interface IMenuModel extends IMenuWithoutId, Document {
  id: number;
}

const menuSchema = new Schema<IMenuModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    link_type: { 
      type: String, 
      required: true, 
      enum: ['sub', 'link'],
      default: 'link'
    },
    path: { type: String, trim: true },
    parent_id: { type: Number, default: null },
    sort: { type: Number, default: 0 },
    mega_menu: { type: Number, default: 0 }, // 0 o 1
    mega_menu_type: { 
      type: String, 
      enum: ['simple', 'link_with_image', 'side_banner', 'bottom_banner', 'product_box', 'blog_box'],
      default: 'simple'
    },
    set_page_link: { type: String, trim: true },
    badge_text: { type: String, trim: true },
    badge_color: { type: String, trim: true },
    is_target_blank: { type: Number, default: 0 }, // 0 o 1
    product_ids: [{ type: Number }],
    blog_ids: [{ type: Number }],
    banner_image_id: { type: Number, default: null },
    item_image_id: { type: Number, default: null },
    status: { type: Number, default: 1 }, // 0 o 1
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

// Virtual para banner_image
menuSchema.virtual("banner_image", {
  ref: "Attachment",
  localField: "banner_image_id",
  foreignField: "id",
  justOne: true
});

// Virtual para item_image
menuSchema.virtual("item_image", {
  ref: "Attachment",
  localField: "item_image_id",
  foreignField: "id",
  justOne: true
});

// Plugin de autoincremento
menuSchema.plugin(AutoIncrement, {
  inc_field: "id",
  id: "menu_id_counter",
});

export default mongoose.model<IMenuModel>("Menu", menuSchema);
