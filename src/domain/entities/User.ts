export interface Attachment {
  id: number;
  name: string;
  url: string;
  type: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentDetails {
  id?: number;
  user_id?: number;
  account_type?: string;
  account_number?: string;
  bank_name?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface UserAddress {
  id?: number;
  user_id?: number;
  title?: string;
  default?: boolean;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Point {
  id?: number;
  user_id?: number;
  points?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Wallet {
  id?: number;
  user_id?: number;
  balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IUser {
  id?: number;
  name: string;
  email: string;
  phone: string;
  country_code: number;
  profile_image?: Attachment;
  profile_image_id?: number;
  status: boolean;
  email_verified_at?: string;
  payment_account?: PaymentDetails;
  role_id: number;
  role_name?: string;
  role?: Role;
  address?: UserAddress[];
  point?: Point;
  wallet?: Wallet;
  is_approved: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}