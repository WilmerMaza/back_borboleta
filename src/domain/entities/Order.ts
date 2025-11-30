export interface IOrderItem {
  product_id: string;
  variation_id?: string;
  quantity: number;
  price: number;
  sale_price: number;
  discount: number;
  total: number;
  name?: string;
  image?: string;
  sub_total?: number;
}

export interface IAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface IOrder {
  id?: string;
  order_number?: string;
  user_id: string;
  store_id: number;
  items: IOrderItem[];
  total_amount: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  shipping_address: IAddress;
  billing_address: IAddress;
  notes?: string;
  tracking_number?: string;
  estimated_delivery?: Date;
  shipping_cost?: number;
  tax_amount?: number;
  discount_amount?: number;
  subtotal?: number;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status_activities?: IOrderStatusActivity[];
  created_at?: string;
  updated_at?: string;
  // Campos adicionales para información del cliente
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  // Campos adicionales para información de la tienda
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  store_banner?: string;
  store_address?: string;
  store_phone?: string;
  store_email?: string;
  store_status?: boolean;
  // Campos adicionales para información del producto
  product_name?: string;
  product_description?: string;
  product_images?: string[];
  product_status?: boolean;
  // Campos adicionales para cupones
  coupon_id?: number;
  coupon_code?: string;
  coupon_discount?: number;
  coupon_type?: string;
  coupon_status?: boolean;
  // Campos adicionales para direcciones
  billing_address_id?: number;
  shipping_address_id?: number;
  // Campos adicionales para pagos
  payment_mode?: string;
  order_payment_status?: string;
  payment_reference?: string; // Referencia de Wompi (ej: 3JEX01KLM7ZGT)
  // Campos adicionales para envío
  delivery_description?: string;
  delivery_interval?: string;
  // Campos adicionales para órdenes
  parent_id?: number;
  created_by_id?: number;
  invoice_url?: string;
  is_digital_only?: boolean;
  is_guest?: number;
  order_status_id?: number;
  delivered_at?: Date;
  // Campos adicionales para transacciones
  transactions?: Array<{
    id: number;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  // Campos adicionales para sub-órdenes
  sub_orders?: Array<{
    id: number;
    order_number: string;
    status: string;
    total: number;
  }>;
}

export interface IOrderStatusActivity {
  id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  order_id: number;
  changed_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
} 