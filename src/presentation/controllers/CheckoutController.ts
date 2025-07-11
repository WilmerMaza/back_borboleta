import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { CheckoutService } from '../../application/services/CheckoutService';
import { CheckoutPayload } from '../../domain/entities/Checkout';

@injectable()
export class CheckoutController {
  constructor(
    @inject('CheckoutService') private checkoutService: CheckoutService
  ) {}

  // POST /api/checkout - Calcular totales antes de crear la orden
  async calculateCheckout(req: Request, res: Response): Promise<void> {
    try {
      const payload: CheckoutPayload = req.body;

      console.log('🛒 Calculando checkout:', payload);

      // Validaciones básicas
      if (!payload.products || payload.products.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Debe incluir al menos un producto'
        });
        return;
      }

      if (!payload.payment_method) {
        res.status(400).json({
          success: false,
          message: 'El método de pago es requerido'
        });
        return;
      }

      if (!payload.delivery_description) {
        res.status(400).json({
          success: false,
          message: 'La descripción de entrega es requerida'
        });
        return;
      }

      // Calcular checkout
      const result = await this.checkoutService.calculateCheckout(payload);

      console.log('✅ Checkout calculado exitosamente');

      res.status(200).json(result);

    } catch (error: any) {
      console.error('❌ Error calculando checkout:', error.message);
      
      res.status(400).json({
        success: false,
        message: error.message || 'Error al calcular checkout'
      });
    }
  }
} 