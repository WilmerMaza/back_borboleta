export interface ICategory {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  type?: string;
  parent_id?: number;
  category_image?: any;
  category_image_id?: number;
  category_icon?: any;
  category_icon_id?: number;
  commission_rate?: number;
  subcategories?: ICategory[];
  category_meta_image_id?: number;
  category_meta_image?: any;
  meta_title?: string;
  meta_description?: string;
  status?: boolean;
  created_by_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
} 