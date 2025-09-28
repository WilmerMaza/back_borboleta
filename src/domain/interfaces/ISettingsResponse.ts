export interface ISettingsResponse {
  id: number;
  options?: any;
  values?: any;
  name?: string;
}

export interface ISettingsUpdateRequest {
  options: any;
} 