import mongoose from 'mongoose'
import slugify from 'slugify'
import { IProduct } from '../../../domain/entities/Product'

const productSchema = new mongoose.Schema({
  numeric_id: {
    type: Number,
    unique: true
  },
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  type: { type: String },
  product_thumbnail_id: { type: Number},
  watermark: { type: Boolean, default: false },
  watermark_position: { type: String},
  watermark_image_id: { type: Number }, 
  product_galleries_id: [{ type: Number }],
  unit: { type: String },
  weight: { type: Number }, 
  price: { 
    type: Number, 
    required: true,
    min: [0, 'El precio no puede ser negativo'],
    validate: {
      validator: function(v: number) {
        return typeof v === 'number' && !isNaN(v) && v >= 0;
      },
      message: 'El precio debe ser un número válido mayor o igual a 0'
    }
  },
  sale_price: { type: Number },
  discount: { type: Number },
  wholesale_price_type: { type: String },
  is_sale_enable: { type: Boolean, default: false },
  sale_starts_at: { type: Date },
  sale_expired_at: { type: Date },
  sku: { type: String},
  stock_status: { type: String  },
  stock: { type: Number, default: 0 },
  visible_time: { type: String },
  quantity: { type: Number, default: 0 },
  store_id: { type: Number},
  size_chart_image_id: { type: Number },
  estimated_delivery_text: { type: String },
  return_policy_text: { type: String },
  safe_checkout: { type: Boolean, default: true },
  secure_checkout: { type: Boolean, default: true },
  social_share: { type: Boolean, default: true },
  encourage_order: { type: Boolean, default: false },
  encourage_view: { type: Boolean, default: false },
  is_free_shipping: { type: Boolean, default: false },
  is_featured: { type: Boolean, default: false },
  is_trending: { type: Boolean, default: false },
  is_return: { type: Boolean, default: false },
  shipping_days: { type: Number },
  tax_id: { type: Number },
  status: { type: Boolean, default: true },
  meta_title: { type: String },
  meta_description: { type: String },
  product_meta_image_id: { type: Number },
  brand_id: { type: Number }, 
  store_name: { type: String },
  orders_count: { type: mongoose.Schema.Types.Mixed },
  order_amount: { type: mongoose.Schema.Types.Mixed },
  attribute_values: [{ type: mongoose.Schema.Types.Mixed }],
  attributes_ids: [{ type: Number }],
  is_random_related_products: { type: Boolean, default: false },
  digital_file_ids: [{ type: Number }],
  is_licensable: { type: Boolean, default: false },
  is_licensekey_auto: { type: String },
  license_key: { type: String },
  separator: { type: String },
  preview_type: { type: String },
  preview_audio_file_id: { type: Number },
  preview_video_file_id: { type: Number },
  preview_url: { type: String },
  is_external: { type: Boolean, default: false },
  external_url: { type: String },
  external_button_text: { type: String },
  related_products: [{ type: Number }],
  cross_sell_products: [{ type: Number }],
  created_by_id: { type: Number }, 
  is_approved: { type: Boolean, default: false },
  total_in_approved_products: { type: Number, default: 0 },
  published_at: { type: Date }
}, {
  timestamps: true
})


productSchema.pre('save', async function (next) {
  console.log('🛠️ Middleware pre-save ejecutado para producto:', this.name);
  console.log('🛠️ numeric_id actual:', this.numeric_id);
  
  if (!this.numeric_id) {
    console.log('🛠️ Buscando último producto con numeric_id...');
    const lastProduct = await mongoose.models.Product.findOne({ numeric_id: { $exists: true } }).sort({ numeric_id: -1 });
    console.log('🛠️ Último producto encontrado:', lastProduct ? { id: lastProduct._id, numeric_id: lastProduct.numeric_id } : 'No hay productos con numeric_id');
    
    this.numeric_id = lastProduct ? lastProduct.numeric_id + 1 : 1;
    console.log('🆕 numeric_id asignado:', this.numeric_id);
  }
  
 
  if (!this.slug && this.name) {
    let baseSlug = slugify(this.name, { lower: true, strict: true })
    let uniqueSlug = baseSlug
    let counter = 1

    while (await mongoose.models.Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`
    }

    this.slug = uniqueSlug
  }
  next()
})

export default mongoose.model<IProduct & mongoose.Document>('Product', productSchema)
