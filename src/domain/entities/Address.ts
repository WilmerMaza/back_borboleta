export interface State {
  id: number;
  name: string;
  country_id: number;
}

export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface IAddress {
  id?: number;
  user_id: number;
  title: string;
  street: string;
  type?: 'billing' | 'shipping';
  city: string;
  pincode: string;
  state_id: number;
  state?: State;
  country_id: number;
  country?: Country;
  country_code: number;
  phone: number;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}
