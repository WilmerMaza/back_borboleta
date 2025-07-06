import mongoose from 'mongoose';
import { IOrder } from '../../../domain/entities/Order';

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariation'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  sale_price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postal_code: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    unique: true,
    sparse: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store_id: {
    type: Number,
    required: true
  },
  items: [orderItemSchema],
  total_amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    required: true
  },
  shipping_address: addressSchema,
  billing_address: addressSchema,
  notes: String,
  tracking_number: String,
  estimated_delivery: Date,
  shipping_cost: {
    type: Number,
    default: 0
  },
  tax_amount: {
    type: Number,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Middleware para generar número de orden automáticamente
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.order_number) {
    try {
      const OrderModel = this.constructor as any;
      const count = await OrderModel.countDocuments();
      // Generar número secuencial simple: 001, 002, 003, etc.
      const orderNumber = (count + 1).toString().padStart(3, '0');
      this.order_number = orderNumber;
      console.log('🔄 Generando order_number:', this.order_number);
    } catch (error) {
      console.error('❌ Error generando order_number:', error);
      // Fallback: usar timestamp si hay error
      this.order_number = Date.now().toString();
    }
  }
  next();
});

export default mongoose.model<IOrder & mongoose.Document>('Order', orderSchema); 