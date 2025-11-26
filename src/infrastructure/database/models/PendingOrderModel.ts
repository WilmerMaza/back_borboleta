import mongoose from 'mongoose';

export interface IPendingOrder {
  _id?: string;
  reference: string; // Referencia única de Wompi
  user_id: string;
  store_id: number;
  items: any[];
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  shipping_address: any;
  billing_address: any;
  coupon?: any;
  delivery_description?: string;
  delivery_interval?: string;
  notes?: string;
  points_amount?: number;
  wallet_balance?: number;
  expires_at: Date; // Fecha de expiración (por defecto 1 hora)
  created_at?: Date;
  updated_at?: Date;
}

const pendingOrderSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user_id: {
      type: String,
      required: true
    },
    store_id: {
      type: Number,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    total_amount: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
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
    shipping_address: {
      type: Object,
      required: true
    },
    billing_address: {
      type: Object,
      required: true
    },
    coupon: {
      type: Object,
      default: null
    },
    delivery_description: {
      type: String,
      default: ''
    },
    delivery_interval: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    points_amount: {
      type: Number,
      default: 0
    },
    wallet_balance: {
      type: Number,
      default: 0
    },
    expires_at: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Índice para búsqueda rápida por reference
pendingOrderSchema.index({ reference: 1 });
pendingOrderSchema.index({ user_id: 1 });
// Índice TTL: MongoDB eliminará automáticamente documentos donde expires_at < ahora
pendingOrderSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IPendingOrder & mongoose.Document>('PendingOrder', pendingOrderSchema);

