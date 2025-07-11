import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateCategoryUseCase } from '../../application/use-cases/CreateCategoryUseCase';
import { GetCategoriesUseCase } from '../../application/use-cases/GetCategoriesUseCase';
import { CreateCategoryCommand } from '../../application/commands/category/CreateCategoryCommand';
import { UpdateCategoryCommand } from '../../application/commands/category/UpdateCategoryCommand';
import { UpdateCategoryHandler } from '../../application/command-handlers/category/UpdateCategoryHandler';
import { DeleteCategoryCommand } from '../../application/commands/category/DeleteCategoryCommand';
import { DeleteCategoryHandler } from '../../application/command-handlers/category/DeleteCategoryHandler';

@injectable()
export class CategoryController {
  constructor(
    @inject('CreateCategoryUseCase')
    private createCategoryUseCase: CreateCategoryUseCase,
    @inject('GetCategoriesUseCase')
    private getCategoriesUseCase: GetCategoriesUseCase,
    @inject('UpdateCategoryHandler')
    private updateCategoryHandler: UpdateCategoryHandler,
    @inject('DeleteCategoryHandler')
    private deleteCategoryHandler: DeleteCategoryHandler
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const categoryData = req.body;
      
      // Validar datos requeridos
      if (!categoryData.name) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la categoría es requerido'
        });
        return;
      }

      const command = new CreateCategoryCommand(categoryData);
      const category = await this.createCategoryUseCase.execute(command.data);

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: category
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { 
        parent_id, 
        status, 
        type, 
        limit = 10, 
        page = 1 
      } = req.query;

      const options = {
        parent_id: parent_id ? parseInt(parent_id as string) : undefined,
        status: status !== undefined ? status === '1' : undefined,
        type: type as string,
        limit: parseInt(limit as string),
        page: parseInt(page as string)
      };

      const result = await this.getCategoriesUseCase.execute(options);

      res.status(200).json({
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.getCategoriesUseCase.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Categoría obtenida exitosamente',
        data: category
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await this.getCategoriesUseCase.getCategoryBySlug(slug);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Categoría obtenida exitosamente',
        data: category
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getSubcategories(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.params;
      const subcategories = await this.getCategoriesUseCase.getSubcategories(parentId);

      res.status(200).json({
        success: true,
        message: 'Subcategorías obtenidas exitosamente',
        data: subcategories
      });
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'El ID de la categoría es requerido'
        });
        return;
      }

      console.log('📁 Actualizando categoría con ID:', id);
      console.log('📁 Datos de actualización:', req.body);

      const command = new UpdateCategoryCommand(id, req.body);
      const category = await this.updateCategoryHandler.handle(command);
      
      res.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: category
      });
    } catch (error: any) {
      console.error('❌ Error al actualizar categoría:', error.message);
      
      if (error.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar la categoría'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'El ID de la categoría es requerido'
        });
        return;
      }

      console.log('🗑️ Eliminando categoría con ID:', id);

      const command = new DeleteCategoryCommand(id);
      const deleted = await this.deleteCategoryHandler.handle(command);
      
      res.status(200).json({
        success: true,
        message: 'Categoría eliminada exitosamente',
        data: { deleted }
      });
    } catch (error: any) {
      console.error('❌ Error al eliminar categoría:', error.message);
      
      if (error.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      if (error.message.includes('subcategorías')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar la categoría'
      });
    }
  }
} 