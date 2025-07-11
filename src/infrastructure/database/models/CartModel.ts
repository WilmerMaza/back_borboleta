import mongoose from 'mongoose';

import { Cart } from '../../../domain/entities/Cart';

const cartItemSchema = new mongoose.Schema({
  numeric_id: {
    type: Number,
    required: true
  },
  product_id: {
    type: Number
  },
  variation_id: {
    type: String,
    default: null
  },
  wholesale_price: {
    type: Number,
    default: null
  },
  consumer_id: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  sub_total: {
    type: Number,

  },
  product: {
    type: Object,
    default: {}
  },
  variation: {
    type: Object,
    default: {}
  },
  created_by_id: {
    type: String,
    default: null
  },
  deleted_at: {
    type: Date,
    default: null
  }
});

const cartSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  total_amount: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  is_digital_only: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Middleware para calcular totales automáticamente
cartSchema.pre('save', function(next) {
  let subtotal = 0;
  
  this.items.forEach((item: any) => {
    subtotal += item.total;
  });
  
  this.subtotal = subtotal;
  this.total_amount = subtotal;
  
  next();
});

export default mongoose.model<Cart>('Cart', cartSchema); 