import { ICommand } from '../../../domain/interfaces/ICommand';

export interface UpdateAttributeRequest {
  name?: string;
  style?: "rectangle" | "circle" | "color" | "radio" | "image" | "dropdown";
  status?: boolean;
  value?: Array<{
    id?: number;
    value: string;
    hex_color?: string | null;
  }>;
}

export class UpdateAttributeCommand implements ICommand {
  constructor(
    private readonly id: number,
    private readonly attributeData: UpdateAttributeRequest
  ) {}

  get data(): { id: number; update: UpdateAttributeRequest } {
    return { id: this.id, update: this.attributeData };
  }
}

