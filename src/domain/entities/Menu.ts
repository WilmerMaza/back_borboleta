import { Attachment } from './Attachment';

export interface IMenu {
  id?: number;
  title: string;
  link_type: 'sub' | 'link';
  path?: string;
  parent_id?: number | null;
  sort: number;
  mega_menu: number | boolean;
  mega_menu_type?: 'simple' | 'link_with_image' | 'side_banner' | 'bottom_banner' | 'product_box' | 'blog_box';
  set_page_link?: string;
  badge_text?: string;
  badge_color?: string;
  is_target_blank: boolean | number;
  product_ids?: number[];
  blog_ids?: number[];
  banner_image_id?: number | null;
  banner_image?: Attachment | null;
  item_image_id?: number | null;
  item_image?: Attachment | null;
  status: number | boolean;
  child?: IMenu[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface MenuCreateRequest {
  title: string;
  link_type: 'sub' | 'link';
  path?: string;
  parent_id?: number | null;
  sort?: number;
  mega_menu?: number | boolean;
  mega_menu_type?: 'simple' | 'link_with_image' | 'side_banner' | 'bottom_banner' | 'product_box' | 'blog_box';
  set_page_link?: string;
  badge_text?: string;
  badge_color?: string;
  is_target_blank?: boolean | number;
  product_ids?: number[];
  blog_ids?: number[];
  banner_image_id?: number | null;
  item_image_id?: number | null;
  status?: number | boolean;
}

export interface MenuUpdateRequest {
  title?: string;
  link_type?: 'sub' | 'link';
  path?: string;
  parent_id?: number | null;
  sort?: number;
  mega_menu?: number | boolean;
  mega_menu_type?: 'simple' | 'link_with_image' | 'side_banner' | 'bottom_banner' | 'product_box' | 'blog_box';
  set_page_link?: string;
  badge_text?: string;
  badge_color?: string;
  is_target_blank?: boolean | number;
  product_ids?: number[];
  blog_ids?: number[];
  banner_image_id?: number | null;
  item_image_id?: number | null;
  status?: number | boolean;
}

export interface MenuSortRequest {
  menus: Array<{
    id: number;
    parent_id: number | null;
    sort: number;
    child: Array<{
      id: number;
      parent_id: number;
      sort: number;
      child: any[];
    }>;
  }>;
}
