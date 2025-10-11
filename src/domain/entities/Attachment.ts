export interface Attachment {
  id?: number;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: string;
  original_url: string;
  asset_url: string;
  file_path: string;
  created_by_id: number;
  created_at?: Date;
  updated_at?: Date;
}