import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateProductCommand } from '../../application/commands/product/CreateProductCommand';
import { CreateProductHandler } from '../../application/command-handlers/product/CreateProductHandler';
import { GetProductByIdQuery } from '../../application/queries/product/GetProductByIdQuery';
import { GetProductByIdHandler } from '../../application/query-handlers/product/GetProductByIdHandler';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';

@injectable()
export class ProductController {
  constructor(
    @inject("ProductRepository") private productRepository: ProductRepository,
    @inject("CreateProductHandler") private createProductHandler: CreateProductHandler,
    @inject("GetProductByIdHandler") private getProductByIdHandler: GetProductByIdHandler
  ) {}

  handleCreateProduct = async (req: Request, res: Response) => {
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
  };

  handleGetProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = new GetProductByIdQuery(Number(req.params.id), this.productRepository);
      const product = await this.getProductByIdHandler.handle(query);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      console.error('❌ Error al obtener producto:', error.message);

      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  };
}
