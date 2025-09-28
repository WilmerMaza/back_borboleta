import mongoose, { Schema, Document } from "mongoose";
import { IProduct } from "src/domain/entities/Product";
const AutoIncrement = require("mongoose-sequence")(mongoose);

interface IProductModel extends Omit<IProduct, "id">, Document {
  id: number;
}

const productSchema = new Schema<IProductModel>(
  {
    name: { type: String, required: true },
    short_description: { type: String },
    description: { type: String },
    type: { type: String },
    unit: { type: String },
    weight: { type: Number },
    quantity: { type: Number },
    price: { type: Number, required: true },
    sale_price: { type: Number },
    discount: { type: Number },
    is_featured: { type: Number },
    shipping_days: { type: Number },
    is_cod: { type: Number },
    is_free_shipping: { type: Number },
    is_sale_enable: { type: Number },
    is_return: { type: Number },
    is_trending: { type: Number },
    is_approved: { type: Number },
    is_external: { type: Number },
    external_url: { type: String },
    external_button_text: { type: String },
    sale_starts_at: { type: Date },
    sale_expired_at: { type: Date },
    sku: { type: String },
    is_random_related_products: { type: Number },
    stock_status: { type: String },
    meta_title: { type: String },
    meta_description: { type: String },
    product_thumbnail_id: { type: Number },
    product_meta_image_id: { type: Number },
    size_chart_image_id: { type: Number },
    estimated_delivery_text: { type: String },
    return_policy_text: { type: String },
    safe_checkout: { type: Boolean },
    secure_checkout: { type: Boolean },
    social_share: { type: Boolean },
    encourage_order: { type: Boolean },
    encourage_view: { type: Boolean },
    slug: { type: String, unique: true },
    status: { type: Number },
    store_id: { type: Number },
    created_by_id: { type: Number },
    tax_id: { type: Number },
    preview_type: { type: String },
    product_type: { type: String },
    separator: { type: String },
    is_licensable: { type: Boolean },
    license_type: { type: String },
    preview_url: { type: String },
    watermark: { type: Boolean },
    watermark_position: { type: String },
    brand_id: { type: Number },
    watermark_image_id: { type: Number },
    wholesale_price_type: { type: String },
    is_licensekey_auto: { type: Number },
    preview_audio_file_id: { type: Number },
    preview_video_file_id: { type: Number },
    deleted_at: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    orders_count: { type: Number },
    reviews_count: { type: Number },
    can_review: { type: Boolean },
    order_amount: { type: Number },
    is_wishlist: { type: Boolean },
    rating_count: { type: Number },
    review_ratings: [{ type: Number }],
    related_products: [{ type: Number }],
    cross_sell_products: [{ type: Number }],

    // Asociaciones (guardamos solo los IDs, los detalles se pueden poblar)
    wholesales: [{ type: Schema.Types.Mixed }],
    variations: [{ type: Schema.Types.ObjectId, ref: "Variation" }],
    product_thumbnail: { type: Schema.Types.ObjectId, ref: "Attachment" },
    product_galleries: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
    attributes: [{ type: Schema.Types.ObjectId, ref: "Attribute" }],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    store: { type: Schema.Types.ObjectId, ref: "Store" },
    reviews: [{ type: Schema.Types.Mixed }],
    similar_products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    cross_products: [{ type: Schema.Types.Mixed }],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Auto-increment para campo `id`
productSchema.plugin(AutoIncrement, {
  inc_field: "id",
  id: "product_id_counter",
});

export default mongoose.model<IProductModel>("Product", productSchema);
