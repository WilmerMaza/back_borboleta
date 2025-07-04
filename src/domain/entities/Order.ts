export interface IOrderItem {
  product_id: string;
  variation_id?: string;
  quantity: number;
  price: number;
  sale_price: number;
  discount: number;
  total: number;
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
  created_at?: string;
  updated_at?: string;
} 