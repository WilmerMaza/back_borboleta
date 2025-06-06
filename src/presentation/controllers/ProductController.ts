import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateProductCommand } from '../../application/commands/product/CreateProductCommand';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { GetProductsHandler } from '../../application/command-handlers/product/GetProductsHandler';

@injectable()
export class ProductController {
  constructor(
    @inject("CreateProductHandler") private createProductHandler: CreateProductHandler,
    @inject("GetProductsHandler") private getProductsHandler: GetProductsHandler
  ) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const command = new CreateProductCommand(req.body);
      const product = await this.createProductHandler.handle(command);
      
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      console.error('❌ Error al crear producto:', error.message);
      
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
}