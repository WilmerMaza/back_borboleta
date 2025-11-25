import { IAttributeValue } from "./AttributeValue";

export interface IAttribute {
  id?: number;
  name: string;
  slug?: string;
  style: "rectangle" | "circle" | "color" | "radio" | "image" | "dropdown";
  status?: boolean;
  created_by_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  attribute_values?: IAttributeValue[];
}

