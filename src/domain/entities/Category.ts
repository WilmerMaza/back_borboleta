import { Attachment } from "./Attachment";

export interface ICategory {
  id?: number; // tu campo autoincremental
  name: string;
  slug?: string;
  description?: string;
  type?: string;
  parent_id?: any;
  category_image?: Attachment;
  category_image_id?: number;
  category_icon?: Attachment;
  category_icon_id?: number;
  commission_rate?: number;
  subcategories?: ICategory[];
  products_count: number;
  category_meta_image_id?: number;
  category_meta_image?: Attachment;
  meta_title?: string;
  meta_description?: string;
  status?: Number;
  created_by_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
} 