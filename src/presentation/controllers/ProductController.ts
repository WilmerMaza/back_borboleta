import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateProductCommand } from '../../application/commands/product/CreateProductCommand';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';


@injectable()
export class ProductController {
  constructor(
    @inject("CreateProductHandler") private createProductHandler: CreateProductHandler,

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

}