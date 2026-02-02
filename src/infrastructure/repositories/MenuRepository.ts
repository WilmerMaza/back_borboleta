import { injectable, inject } from "tsyringe";
import MenuModel from "../database/models/MenuModel";
import { IMenu } from "../../domain/entities/Menu";
import { IMenuRepository } from "../../domain/repositories/IMenuRepository";
import { IAttachmentRepository } from "../../domain/repositories/IAttachmentRepository";

@injectable()
export class MenuRepository implements IMenuRepository {
  constructor(
    @inject('IAttachmentRepository') private attachmentRepository: IAttachmentRepository
  ) {}

  async create(menu: Partial<IMenu>): Promise<IMenu> {
    // Normalizar valores booleanos a números
    const menuData: any = {
      ...menu,
      mega_menu: typeof menu.mega_menu === 'boolean' ? (menu.mega_menu ? 1 : 0) : menu.mega_menu || 0,
      is_target_blank: typeof menu.is_target_blank === 'boolean' ? (menu.is_target_blank ? 1 : 0) : menu.is_target_blank || 0,
      status: typeof menu.status === 'boolean' ? (menu.status ? 1 : 0) : menu.status || 1,
      parent_id: menu.parent_id || null,
      sort: menu.sort || 0
    };

    const menuDoc = new MenuModel(menuData);
    const savedMenu = await menuDoc.save();
    
    // Poblar imágenes si existen
    const populatedMenu = await this.populateMenu(savedMenu.toObject());
    return populatedMenu;
  }

  async findAll(options?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: boolean | number;
  }): Promise<{ data: IMenu[]; total: number; current_page: number; per_page: number }> {
    const page = options?.page || 1;
    const per_page = options?.per_page || 15;
    const skip = (page - 1) * per_page;

    // Construir filtros
    const filters: any = { deleted_at: null };
    
    if (options?.status !== undefined) {
      const statusValue = typeof options.status === 'boolean' ? (options.status ? 1 : 0) : options.status;
      filters.status = statusValue;
    }
    
    if (options?.search) {
      filters.title = { $regex: options.search, $options: 'i' };
    }

    // Obtener total
    const total = await MenuModel.countDocuments(filters);
    
    // Obtener menús con paginación
    const menus = await MenuModel.find(filters)
      .skip(skip)
      .limit(per_page)
      .sort({ sort: 1, created_at: -1 });

    // Poblar imágenes y construir estructura jerárquica
    const populatedMenus = await Promise.all(
      menus.map(menu => this.populateMenu(menu.toObject()))
    );

    return {
      data: populatedMenus,
      total,
      current_page: page,
      per_page
    };
  }

  async findById(id: number): Promise<IMenu | null> {
    const menu = await MenuModel.findOne({ id, deleted_at: null });
    if (!menu) return null;

    const populatedMenu = await this.populateMenu(menu.toObject());
    
    // Si tiene parent_id, incluir también los hijos
    const children = await this.findByParentId(id);
    populatedMenu.child = children;

    return populatedMenu;
  }

  async findByParentId(parentId: number | null): Promise<IMenu[]> {
    const menus = await MenuModel.find({ 
      parent_id: parentId === null ? null : parentId,
      deleted_at: null 
    }).sort({ sort: 1 });

    // Poblar imágenes y construir estructura recursiva
    const populatedMenus = await Promise.all(
      menus.map(async (menu) => {
        const populated = await this.populateMenu(menu.toObject());
        // Buscar hijos recursivamente
        const children = await this.findByParentId(menu.id);
        populated.child = children;
        return populated;
      })
    );

    return populatedMenus;
  }

  async findHierarchy(): Promise<IMenu[]> {
    // Obtener todos los menús raíz (parent_id = null)
    return await this.findByParentId(null);
  }

  async update(id: number, menu: Partial<IMenu>): Promise<IMenu | null> {
    // Normalizar valores booleanos a números
    const updateData: any = { ...menu };
    
    if (menu.mega_menu !== undefined) {
      updateData.mega_menu = typeof menu.mega_menu === 'boolean' ? (menu.mega_menu ? 1 : 0) : menu.mega_menu;
    }
    
    if (menu.is_target_blank !== undefined) {
      updateData.is_target_blank = typeof menu.is_target_blank === 'boolean' ? (menu.is_target_blank ? 1 : 0) : menu.is_target_blank;
    }
    
    if (menu.status !== undefined) {
      updateData.status = typeof menu.status === 'boolean' ? (menu.status ? 1 : 0) : menu.status;
    }

    const updated = await MenuModel.findOneAndUpdate(
      { id, deleted_at: null },
      updateData,
      { new: true }
    );

    if (!updated) return null;

    const populatedMenu = await this.populateMenu(updated.toObject());
    return populatedMenu;
  }

  async updateSort(menus: Array<{ id: number; parent_id: number | null; sort: number }>): Promise<boolean> {
    try {
      // Actualizar todos los menús en una transacción
      const updatePromises = menus.map(menu => 
        MenuModel.findOneAndUpdate(
          { id: menu.id, deleted_at: null },
          { 
            parent_id: menu.parent_id,
            sort: menu.sort 
          },
          { new: true }
        )
      );

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('Error actualizando orden de menús:', error);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    // Verificar si tiene hijos
    const children = await MenuModel.find({ parent_id: id, deleted_at: null });
    if (children.length > 0) {
      // Eliminar hijos en cascada (soft delete)
      await MenuModel.updateMany(
        { parent_id: id },
        { deleted_at: new Date() }
      );
    }

    // Soft delete del menú
    const result = await MenuModel.findOneAndUpdate(
      { id },
      { deleted_at: new Date() },
      { new: true }
    );
    
    return result !== null;
  }

  async validateCircularReference(menuId: number, parentId: number | null): Promise<boolean> {
    if (!parentId || parentId === menuId) {
      return false; // No puede ser padre de sí mismo
    }

    // Verificar que el parentId existe
    const parent = await MenuModel.findOne({ id: parentId, deleted_at: null });
    if (!parent) {
      return false; // El padre no existe
    }

    // Verificar que no hay referencias circulares
    // Si el parentId es un descendiente del menuId, sería circular
    let currentParentId = parent.parent_id;
    while (currentParentId !== null) {
      if (currentParentId === menuId) {
        return false; // Referencia circular detectada
      }
      const currentParent = await MenuModel.findOne({ id: currentParentId, deleted_at: null });
      if (!currentParent) break;
      currentParentId = currentParent.parent_id;
    }

    return true; // No hay referencias circulares
  }

  /**
   * Poblar las imágenes del menú (banner_image e item_image)
   */
  private async populateMenu(menu: any): Promise<IMenu> {
    const populated: any = { ...menu };

    // Poblar banner_image si existe
    if (menu.banner_image_id) {
      const bannerImage = await this.attachmentRepository.findById(menu.banner_image_id);
      populated.banner_image = bannerImage || null;
    } else {
      populated.banner_image = null;
    }

    // Poblar item_image si existe
    if (menu.item_image_id) {
      const itemImage = await this.attachmentRepository.findById(menu.item_image_id);
      populated.item_image = itemImage || null;
    } else {
      populated.item_image = null;
    }

    return populated;
  }
}
