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

export interface AuthStateModel {
  email: String;
  number: { phone: number; country_code: number };
  token: String | Number;
  access_token: String | null;
  permissions: [];
}

export interface IUser {
  id?: number;
  name: string;
  email: string;
  phone: number;
  country_code: number;
  password: string;
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
