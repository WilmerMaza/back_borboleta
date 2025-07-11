export interface CartItem {
  id: number;
  product_id: number;
  variation: any; // Variation interface
  variation_id: number | null;
  wholesale_price: number | null;
  consumer_id?: number;
  quantity: number;
  sub_total: number;
  product: any; // Product interface
  created_by_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface Cart {
  id?: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
  subtotal: number;
  is_digital_only: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartAddOrUpdate {
  id: number | null;
  product: any | null;
  product_id: number;
  variation: any | null;
  variation_id: number | null;
  quantity: number;
} 