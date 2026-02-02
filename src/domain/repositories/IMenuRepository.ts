import { IMenu } from '../entities/Menu';

export interface IMenuRepository {
  create(menu: Partial<IMenu>): Promise<IMenu>;
  findAll(options?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: boolean | number;
  }): Promise<{ data: IMenu[]; total: number; current_page: number; per_page: number }>;
  findById(id: number): Promise<IMenu | null>;
  findByParentId(parentId: number | null): Promise<IMenu[]>;
  findHierarchy(): Promise<IMenu[]>; // Retorna estructura jerárquica completa
  update(id: number, menu: Partial<IMenu>): Promise<IMenu | null>;
  updateSort(menus: Array<{ id: number; parent_id: number | null; sort: number }>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  validateCircularReference(menuId: number, parentId: number | null): Promise<boolean>;
}
