import mongoose from "mongoose";
import { IOrder } from "../../../domain/entities/Order";

const orderItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true,
  },
  product_id: {
    type: Number,
    required: true,
  },
  variation_id: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  sale_price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  sub_total: {
    type: Number,
  },
});

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postal_code: { type: String, required: true },
});

const orderStatusActivitySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed", 
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled"
    ],
    required: true,
  },
  order_id: {
    type: Number,
    required: true,
  },
  changed_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updated_at: {
    type: String,
    default: () => new Date().toISOString(),
  },
  deleted_at: {
    type: String,
    default: null,
  },
});

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      unique: true,
      sparse: true,
    },
    user_id: {
      type: Number,
      required: true,
    },
    store_id: {
      type: Number,
      required: true,
    },
    items: [orderItemSchema],
    total_amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    payment_method: {
      type: String,
      required: true,
    },
    shipping_address: addressSchema,
    billing_address: addressSchema,
    notes: String,
    tracking_number: String,
    estimated_delivery: Date,
    shipping_cost: {
      type: Number,
      default: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    order_status_activities: [orderStatusActivitySchema],
    // Campos adicionales para información del cliente
    customer_name: String,
    customer_email: String,
    customer_phone: String,
    // Campos adicionales para información de la tienda
    store_name: String,
    store_description: String,
    store_logo: String,
    store_banner: String,
    store_address: String,
    store_phone: String,
    store_email: String,
    store_status: {
      type: Boolean,
      default: true,
    },
    // Campos adicionales para información del producto
    product_name: String,
    product_description: String,
    product_images: [String],
    product_status: {
      type: Boolean,
      default: true,
    },
    // Campos adicionales para cupones
    coupon_id: Number,
    coupon_code: String,
    coupon_discount: Number,
    coupon_type: String,
    coupon_status: {
      type: Boolean,
      default: true,
    },
    // Campos adicionales para direcciones
    billing_address_id: Number,
    shipping_address_id: Number,
    // Campos adicionales para pagos
    payment_mode: String,
    order_payment_status: String,
    payment_reference: String, // Referencia de Wompi (ej: 3JEX01KLM7ZGT)
    // Campos adicionales para envío
    delivery_description: String,
    delivery_interval: String,
    // Campos adicionales para órdenes
    parent_id: Number,
    created_by_id: Number,
    invoice_url: String,
    is_digital_only: {
      type: Boolean,
      default: false,
    },
    is_guest: {
      type: Number,
      default: 0,
    },
    order_status_id: Number,
    delivered_at: Date,
    // Campos adicionales para transacciones
    transactions: [{
      id: Number,
      amount: Number,
      currency: String,
      status: String,
      created_at: String,
    }],
    // Campos adicionales para sub-órdenes
    sub_orders: [{
      id: Number,
      order_number: String,
      status: String,
      total: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Middleware para generar número de orden automáticamente
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.order_number) {
    try {
      const OrderModel = this.constructor as any;
      
      // Buscar el último order_number numérico pequeño (no timestamps)
      const lastOrder = await OrderModel.findOne({
        order_number: { $regex: /^\d{1,3}$/ } // Solo números de 1-3 dígitos
      }, { order_number: 1 })
        .sort({ order_number: -1 })
        .limit(1);
      
      let nextNumber = 0;
      if (lastOrder && lastOrder.order_number) {
        // Extraer el número del último order_number
        const lastNumber = parseInt(lastOrder.order_number, 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      
      // Generar número secuencial con padding de 2 dígitos
      const orderNumber = nextNumber.toString().padStart(2, "0");
      this.order_number = orderNumber;
    } catch (error) {
      // Fallback: usar "00" si hay error
      this.order_number = "00";
    }
  }
  next();
});

export default mongoose.model<IOrder & mongoose.Document>("Order", orderSchema);
