import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IMenuRepository } from "../../domain/repositories/IMenuRepository";
import { AuthenticatedRequest } from "../../middleware/auth";
import { MenuCreateRequest, MenuUpdateRequest, MenuSortRequest } from "../../domain/entities/Menu";

@injectable()
export class MenuController {
  constructor(
    @inject("MenuRepository") private menuRepository: IMenuRepository
  ) {}

  // GET /api/menus - Listar menús
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const per_page = parseInt(req.query.per_page as string) || 15;
      const search = req.query.search as string;
      const status = req.query.status !== undefined 
        ? (req.query.status === 'true' || req.query.status === '1' ? 1 : 0)
        : undefined;

      const result = await this.menuRepository.findAll({
        page,
        per_page,
        search,
        status
      });

      res.status(200).json({
        data: result.data,
        total: result.total,
        current_page: result.current_page,
        per_page: result.per_page
      });
    } catch (error: any) {
      console.error("Error al obtener menús:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // GET /api/menus/{id} - Obtener un menú por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const menuId = parseInt(id);

      if (isNaN(menuId) || menuId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de menú inválido"
        });
        return;
      }

      const menu = await this.menuRepository.findById(menuId);

      if (!menu) {
        res.status(404).json({
          success: false,
          message: "Menú no encontrado"
        });
        return;
      }

      res.status(200).json(menu);
    } catch (error: any) {
      console.error("Error al obtener menú:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // GET /api/menus/hierarchy - Obtener estructura jerárquica completa
  async getHierarchy(_req: Request, res: Response): Promise<void> {
    try {
      const menus = await this.menuRepository.findHierarchy();
      res.status(200).json({
        data: menus,
        total: menus.length
      });
    } catch (error: any) {
      console.error("Error al obtener jerarquía de menús:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // POST /api/menus - Crear menú
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const menuData: MenuCreateRequest = req.body;

      // Validaciones
      const validationErrors = this.validateMenuData(menuData, null);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: validationErrors.reduce((acc, err) => {
            acc[err.field] = [err.message];
            return acc;
          }, {} as Record<string, string[]>)
        });
        return;
      }

      // Validar referencias circulares si tiene parent_id
      if (menuData.parent_id) {
        // Verificar que el padre existe
        const parent = await this.menuRepository.findById(menuData.parent_id);
        if (!parent) {
          res.status(400).json({
            success: false,
            message: "El menú padre especificado no existe"
          });
          return;
        }
        // Para crear, no hay riesgo de referencia circular ya que el nuevo menú no tiene hijos aún
      }

      const menu = await this.menuRepository.create(menuData);

      res.status(201).json(menu);
    } catch (error: any) {
      console.error("Error al crear menú:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // PUT /api/menus/{id} - Actualizar menú
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const menuId = parseInt(id);
      const updateData: MenuUpdateRequest = req.body;

      if (isNaN(menuId) || menuId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de menú inválido"
        });
        return;
      }

      // Verificar que el menú existe
      const existingMenu = await this.menuRepository.findById(menuId);
      if (!existingMenu) {
        res.status(404).json({
          success: false,
          message: "Menú no encontrado"
        });
        return;
      }

      // Validaciones
      const validationErrors = this.validateMenuData(updateData, menuId);
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Errores de validación",
          errors: validationErrors.reduce((acc, err) => {
            acc[err.field] = [err.message];
            return acc;
          }, {} as Record<string, string[]>)
        });
        return;
      }

      // Validar referencias circulares si se está cambiando parent_id
      if (updateData.parent_id !== undefined && updateData.parent_id !== existingMenu.parent_id) {
        const isValid = await this.menuRepository.validateCircularReference(menuId, updateData.parent_id);
        if (!isValid) {
          res.status(400).json({
            success: false,
            message: "Referencia circular detectada o padre no válido"
          });
          return;
        }
      }

      const updatedMenu = await this.menuRepository.update(menuId, updateData);

      if (!updatedMenu) {
        res.status(404).json({
          success: false,
          message: "Menú no encontrado"
        });
        return;
      }

      res.status(200).json(updatedMenu);
    } catch (error: any) {
      console.error("Error al actualizar menú:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // PUT /api/menus/sort - Actualizar orden de menús
  async updateSort(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const sortData: MenuSortRequest = req.body;

      if (!sortData.menus || !Array.isArray(sortData.menus)) {
        res.status(400).json({
          success: false,
          message: "Se requiere un array de menús con estructura válida"
        });
        return;
      }

      // Extraer todos los menús de la estructura jerárquica
      const flatMenus: Array<{ id: number; parent_id: number | null; sort: number }> = [];

      const extractMenus = (menus: any[], parentId: number | null = null) => {
        menus.forEach((menu, index) => {
          flatMenus.push({
            id: menu.id,
            parent_id: parentId,
            sort: index
          });
          if (menu.child && Array.isArray(menu.child) && menu.child.length > 0) {
            extractMenus(menu.child, menu.id);
          }
        });
      };

      extractMenus(sortData.menus);

      const success = await this.menuRepository.updateSort(flatMenus);

      if (!success) {
        res.status(500).json({
          success: false,
          message: "Error al actualizar el orden de los menús"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Orden de menús actualizado exitosamente"
      });
    } catch (error: any) {
      console.error("Error al actualizar orden de menús:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  // DELETE /api/menus/{id} - Eliminar menú
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const menuId = parseInt(id);

      if (isNaN(menuId) || menuId <= 0) {
        res.status(400).json({
          success: false,
          message: "ID de menú inválido"
        });
        return;
      }

      const deleted = await this.menuRepository.delete(menuId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Menú no encontrado"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Menú eliminado exitosamente"
      });
    } catch (error: any) {
      console.error("Error al eliminar menú:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message
      });
    }
  }

  /**
   * Valida los datos del menú según los requisitos
   */
  private validateMenuData(menuData: MenuCreateRequest | MenuUpdateRequest, menuId: number | null): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = [];

    // title: requerido
    if (menuData.title !== undefined) {
      if (!menuData.title || menuData.title.trim() === '') {
        errors.push({ field: 'title', message: 'El título es requerido' });
      }
    } else if (menuId === null) {
      errors.push({ field: 'title', message: 'El título es requerido' });
    }

    // link_type: requerido, debe ser "sub" o "link"
    if (menuData.link_type !== undefined) {
      if (!['sub', 'link'].includes(menuData.link_type)) {
        errors.push({ field: 'link_type', message: 'link_type debe ser "sub" o "link"' });
      }
    } else if (menuId === null) {
      errors.push({ field: 'link_type', message: 'link_type es requerido' });
    }

    // path: requerido si link_type = "link"
    if (menuData.link_type === 'link') {
      if (!menuData.path || menuData.path.trim() === '') {
        errors.push({ field: 'path', message: 'path es requerido cuando link_type es "link"' });
      }
    }

    // mega_menu_type: requerido si mega_menu = 1
    const megaMenu = typeof menuData.mega_menu === 'boolean' ? (menuData.mega_menu ? 1 : 0) : (menuData.mega_menu || 0);
    if (megaMenu === 1) {
      if (!menuData.mega_menu_type) {
        errors.push({ field: 'mega_menu_type', message: 'mega_menu_type es requerido cuando mega_menu es 1' });
      } else if (!['simple', 'link_with_image', 'side_banner', 'bottom_banner', 'product_box', 'blog_box'].includes(menuData.mega_menu_type)) {
        errors.push({ field: 'mega_menu_type', message: 'mega_menu_type debe ser uno de: simple, link_with_image, side_banner, bottom_banner, product_box, blog_box' });
      }
    }

    // banner_image_id: requerido si mega_menu_type es "side_banner" o "bottom_banner"
    if (menuData.mega_menu_type === 'side_banner' || menuData.mega_menu_type === 'bottom_banner') {
      if (!menuData.banner_image_id) {
        errors.push({ field: 'banner_image_id', message: 'banner_image_id es requerido cuando mega_menu_type es "side_banner" o "bottom_banner"' });
      }
    }

    // badge_color: requerido si badge_text tiene valor
    if (menuData.badge_text && menuData.badge_text.trim() !== '') {
      if (!menuData.badge_color || menuData.badge_color.trim() === '') {
        errors.push({ field: 'badge_color', message: 'badge_color es requerido cuando badge_text tiene valor' });
      }
    }

    // is_target_blank: requerido si link_type = "link"
    if (menuData.link_type === 'link') {
      if (menuData.is_target_blank === undefined) {
        errors.push({ field: 'is_target_blank', message: 'is_target_blank es requerido cuando link_type es "link"' });
      }
    }

    return errors;
  }
}
