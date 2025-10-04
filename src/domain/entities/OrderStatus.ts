export interface IOrderStatus {
  id?: number;
  name: string;
  sequence: number;
  slug: string;
  activities_date: string;
  created_by_id: number;
  status: boolean;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IOrderStatusActivity {
  id?: number;
  order_id: number;
  order_status_id: number;
  status: string;
  status_name?: string;
  note?: string;
  changed_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface IOrderStatusCounts {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  total: number;
}
