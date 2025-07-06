export interface CartProduct {
  product_id: string;
  variation_id?: string;
  quantity: number;
  price: number;
  sale_price: number;
  discount: number;
  total: number;
}

export interface Address {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface CheckoutPayload {
  products: CartProduct[];
  payment_method: string;
  delivery_description: string;
  coupon?: string | null;
  points_amount: boolean;
  wallet_balance: boolean;
  // Datos del usuario (guest checkout)
  name?: string;
  email?: string;
  country_code?: string;
  phone?: string;
  // Direcciones
  shipping_address?: Address;
  billing_address?: Address;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: {
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    coupon_discount?: number;
    points_discount?: number;
    wallet_discount?: number;
    total_amount: number;
    estimated_delivery?: string;
    available_points?: number;
    wallet_balance?: number;
  };
} 