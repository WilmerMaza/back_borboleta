
export interface IProduct  {
  id: number;
  name: string;
  short_description?: string;
  description?: string;
  type?: string;
  unit?: string;
  weight?: number;
  quantity?: number;
  price: number;
  sale_price?: number;
  discount?: number;
  is_featured?: number;
  shipping_days?: number;
  is_cod?: number;
  is_free_shipping?: number;
  is_sale_enable?: number;
  is_return?: number;
  is_trending?: number;
  is_approved?: number;
  is_external?: number;
  external_url?: string;
  external_button_text?: string;
  sale_starts_at?: Date;
  sale_expired_at?: Date;
  sku?: string;
  is_random_related_products?: Number;
  stock_status?: string;
  meta_title?: string;
  meta_description?: string;
  product_thumbnail_id?: number;
  product_meta_image_id?: number;
  size_chart_image_id?: number;
  estimated_delivery_text?: string;
  return_policy_text?: string;
  safe_checkout?: boolean;
  secure_checkout?: boolean;
  social_share?: boolean;
  encourage_order?: boolean;
  encourage_view?: boolean;
  slug?: string;
  status?: number;
  store_id?: number;
  created_by_id?: number;
  tax_id?: number;
  preview_type?: string;
  product_type?: string;
  separator?: string;
  is_licensable?: boolean;
  license_type?: string;
  preview_url?: string;
  watermark?: boolean;
  watermark_position?: string;
  brand_id?: number;
  watermark_image_id?: number;
  wholesale_price_type?: string;
  is_licensekey_auto?: number;
  preview_audio_file_id?: number;
  preview_video_file_id?: number;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  orders_count?: number;
  reviews_count?: number;
  can_review?: boolean;
  order_amount?: number;
  is_wishlist?: boolean;
  rating_count?: number;
  review_ratings?: number[];
  related_products?: number[];
  cross_sell_products?: number[];
  wholesales?: any[];
  variations?: Ivariation[];
  product_thumbnail?: IProductthumbnail;
  product_galleries?: IProductGalleries[];
  attributes?: Iattributes[];
  categories?: Icategories[];
  tags?: Itags[];
  brand?: Brand;
  store?: store;
  reviews?: any[];
  similar_products?: IProduct[];
  cross_products?: any[];
}

interface store {
  id: number;
  store_name: string;
  slug: string;
  product_images: string[];
  order_amount: number;
  rating_count: number;
  store_logo?: any;
  store_cover?: any;
  vendor?: any;
  country?: any;
  state?: any;
  reviews: any[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  status: number;
  brand_image?: any;
  brand_meta_image?: any;
  brand_banner?: any;
}

interface Itags {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  created_by_id: string;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
  blogs_count: number;
  products_count: number;
  pivot: ItagsPivot;
}
interface ItagsPivot {
  product_id: string;
  tag_id: string;
}

interface Iattributes {
  id: number;
  name: string;
  style: string;
  slug: string;
  status: number;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
  pivot: IattributesPivot;
  attribute_values: Attributevalue[];
}
interface Attributevalue {
  id: number;
  value: string;
  hex_color?: any;
  slug: string;
  attribute_id: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
}
interface IattributesPivot {
  product_id: string;
  attribute_id: string;
}

interface IProductGalleries {
  id: number;
  name: string;
  disk: string;
  file_name: string;
  mime_type: string;
  asset_url: string;
  original_url: string;
}

interface IProductthumbnail {
  id: number;
  name: string;
  disk: string;
  file_name: string;
  mime_type: string;
  asset_url: string;
  original_url: string;
}

interface Ivariation {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock_status: string;
  sale_price: number;
  discount?: any;
  sku: string;
  status: number;
  variation_options?: any;
  preview_url?: any;
  separator?: any;
  is_digital?: any;
  is_licensable: number;
  is_licensekey_auto: number;
  variation_image_id: number;
  product_id: number;
  deleted_at?: any;
  created_at: string;
  updated_at: string;
  variation_image: Variationimage;
  variation_galleries: Variationimage[];
  attribute_values: Attributevalue[];
}

interface Icategories {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_image_id?: any;
  category_icon_id: number;
  status: number;
  meta_title: string;
  meta_description: string;
  category_meta_image_id?: any;
  type: string;
  commission_rate?: any;
  parent_id?: any;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
  blogs_count: number;
  products_count: number;
  pivot: IcategoriesPivot;
  category_image?: any;
  category_meta_image?: any;
  category_icon: Categoryicon;
}
interface Categoryicon {
  id: number;
  name: string;
  disk: string;
  mime_type: string;
  file_name: string;
  asset_url: string;
  original_url: string;
}
interface IcategoriesPivot {
  product_id: string;
  category_id: string;
}

interface Attributevalue {
  id: number;
  value: string;
  hex_color?: any;
  slug: string;
  attribute_id: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: any;
  pivot: AttributevaluePivot;
}
interface AttributevaluePivot {
  variation_id: string;
  attribute_value_id: string;
}
interface Variationimage {
  id: number;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  created_by_id: string;
  created_at: string;
  asset_url: string;
  original_url: string;
}
