export interface IAttributeValue {
  id?: number;
  value: string;
  hex_color?: string | null;
  slug?: string;
  attribute_id: number;
  status?: boolean;
  created_by_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

