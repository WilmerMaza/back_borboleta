import { ICommand } from '../../../domain/interfaces/ICommand';


export interface CreateAttributeRequest {
  name: string;
  style: "rectangle" | "circle" | "color" | "radio" | "image" | "dropdown";
  status?: boolean;
  value: Array<{
    value: string;
    hex_color?: string | null;
  }>;
}

export class CreateAttributeCommand implements ICommand {
  constructor(private readonly attributeData: CreateAttributeRequest) {}

  get data(): CreateAttributeRequest {
    return this.attributeData;
  }
}

