import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateProductCommand } from '../../application/commands/product/CreateProductCommand';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { GetProductsHandler } from '../../application/command-handlers/product/GetProductsHandler';
import { GetProductBySlugCommand } from '../../application/commands/product/GetProductBySlugCommand';
import { GetProductBySlugHandler } from '../../application/command-handlers/product/GetProductBySlugHandler';
import { UpdateProductCommand } from '../../application/commands/product/UpdateProductCommand';
import { UpdateProductHandler } from '../../application/command-handlers/product/UpdateProductHandler';
import { DeleteProductCommand } from '../../application/commands/product/DeleteProductCommand';
import { DeleteProductHandler } from '../../application/command-handlers/product/DeleteProductHandler';
import mongoose from 'mongoose';

@injectable()
export class ProductController {
  constructor(
    @inject("CreateProductHandler") private createProductHandler: CreateProductHandler,
    @inject("GetProductsHandler") private getProductsHandler: GetProductsHandler,
    @inject("GetProductBySlugHandler") private getProductBySlugHandler: GetProductBySlugHandler,
    @inject("UpdateProductHandler") private updateProductHandler: UpdateProductHandler,
    @inject("DeleteProductHandler") private deleteProductHandler: DeleteProductHandler
  ) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      console.log('📦 Datos recibidos en el controlador:', req.body);
      console.log('💰 Precio recibido:', req.body.price, 'Tipo:', typeof req.body.price);

    
      if (req.body.price === undefined || req.body.price === null) {
        throw new Error('El precio es requerido');
      }

      const price = Number(req.body.price);
      console.log('💰 Precio convertido:', price, 'Tipo:', typeof price);

      if (isNaN(price) || price < 0) {
        throw new Error('El precio debe ser un número válido mayor o igual a 0');
      }

      const productData = {
        ...req.body,
        price: price
      };

      console.log('📦 Datos finales del producto:', productData);

      const command = new CreateProductCommand(productData);
      const product = await this.createProductHandler.handle(command);
      
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      console.error('❌ Error al crear producto:', error.message);
      
    
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          details: validationErrors
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear el producto',
        details: error?.errors || null
      });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.getProductsHandler.handle({ page, limit });
      
      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Error al obtener productos:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener los productos',
        details: error?.errors || null
      });
    }
  }

  async getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        res.status(400).json({
          success: false,
          message: 'El slug es requerido'
        });
        return;
      }

      const command = new GetProductBySlugCommand(slug);
      const product = await this.getProductBySlugHandler.handle(command);
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      console.error('❌ Error al obtener producto por slug:', error.message);
      
      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener el producto',
        details: error?.errors || null
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined' || id === 'null') {
        res.status(400).json({
          success: false,
          message: 'El ID del producto es requerido y debe ser válido'
        });
        return;
      }

      // Validar que el ID tenga el formato correcto de MongoDB ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID del producto debe tener un formato válido'
        });
        return;
      }

      console.log('📦 Actualizando producto con ID:', id);
      console.log('📦 Datos de actualización:', req.body);

      // Validar que el precio sea un número válido si se está actualizando
      if (req.body.price !== undefined && req.body.price !== null) {
        const price = Number(req.body.price);
        if (isNaN(price) || price < 0) {
          throw new Error('El precio debe ser un número válido mayor o igual a 0');
        }
        req.body.price = price;
      }

      const command = new UpdateProductCommand(id, req.body);
      const product = await this.updateProductHandler.handle(command);
      
      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });
    } catch (error: any) {
      console.error('❌ Error al actualizar producto:', error.message);
      
      // Manejar errores de validación de Mongoose
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          details: validationErrors
        });
        return;
      }
      
      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar el producto',
        details: error?.errors || null
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id || id === 'undefined' || id === 'null') {
        res.status(400).json({
          success: false,
          message: 'El ID del producto es requerido y debe ser válido'
        });
        return;
      }

      // Validar que el ID tenga el formato correcto de MongoDB ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID del producto debe tener un formato válido'
        });
        return;
      }

      console.log('🗑️ Eliminando producto con ID:', id);

      const command = new DeleteProductCommand(id);
      const deleted = await this.deleteProductHandler.handle(command);
      
      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente',
        data: { deleted }
      });
    } catch (error: any) {
      console.error('❌ Error al eliminar producto:', error.message);
      
      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al eliminar el producto',
        details: error?.errors || null
      });
    }
  }
}