import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { CheckoutPayload, CheckoutResponse } from '../../domain/entities/Checkout';


@injectable()
export class CheckoutService {
  constructor(
    @inject('ProductRepository') private productRepository: IProductRepository
  ) {}

  async calculateCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    try {
      console.log('🛒 Calculando checkout:', payload);

      // Validar productos
      if (!payload.products || payload.products.length === 0) {
        throw new Error('Debe incluir al menos un producto');
      }

      // Validar método de pago
      if (!payload.payment_method) {
        throw new Error('El método de pago es requerido');
      }

      // Validar descripción de entrega
      if (!payload.delivery_description) {
        throw new Error('La descripción de entrega es requerida');
      }

      let subtotal = 0;
      let totalDiscount = 0;
      const validatedProducts = [];

      // Validar y calcular cada producto
      for (const product of payload.products) {
        console.log('🛍️ Validando producto:', product);

        // Validar que product_id sea un string válido
        if (!product.product_id || typeof product.product_id !== 'string') {
          throw new Error(`Product ID inválido: ${product.product_id}`);
        }

        // Buscar producto por _id (ObjectId) usando el product_id como string
        const dbProduct = await this.productRepository.findById(product.product_id);
        if (!dbProduct) {
          throw new Error(`Producto no encontrado: ${product.product_id}`);
        }

        // Validar cantidad
        if (!product.quantity || product.quantity < 1) {
          throw new Error(`Cantidad inválida para producto: ${dbProduct.name}`);
        }

        // Validar stock (solo si el producto tiene control de stock habilitado)
        if (dbProduct.stock !== undefined && typeof dbProduct.stock === 'number' && dbProduct.stock > 0 && dbProduct.stock < product.quantity) {
          throw new Error(`Stock insuficiente para ${dbProduct.name}. Disponible: ${dbProduct.stock}`);
        }

        // Calcular precios
        const price = dbProduct.price || 0;
        const discount = dbProduct.discount || 0;
        const sale_price = discount > 0 ? price - (price * discount / 100) : price;
        const total = sale_price * product.quantity;
        const itemDiscount = (price - sale_price) * product.quantity;

        console.log('💰 Cálculos del producto:', {
          name: dbProduct.name,
          price,
          discount,
          sale_price,
          quantity: product.quantity,
          total,
          itemDiscount
        });

        validatedProducts.push({
          ...product,
          price,
          sale_price,
          discount,
          total
        });

        subtotal += total;
        totalDiscount += itemDiscount;
      }

      // Calcular costos adicionales
      const taxAmount = this.calculateTax(subtotal, payload.shipping_address?.country);
      const shippingCost = this.calculateShippingCost(payload.delivery_description, payload.shipping_address);
      const couponDiscount = await this.calculateCouponDiscount(payload.coupon, subtotal);
      const pointsDiscount = this.calculatePointsDiscount(payload.points_amount, subtotal);
      const walletDiscount = this.calculateWalletDiscount(payload.wallet_balance, subtotal);

      // Calcular descuento total
      const totalDiscountAmount = totalDiscount + couponDiscount + pointsDiscount + walletDiscount;

      // Calcular total final
      const totalAmount = subtotal + taxAmount + shippingCost - totalDiscountAmount;

      console.log('💰 Totales calculados:', {
        subtotal,
        taxAmount,
        shippingCost,
        totalDiscount,
        couponDiscount,
        pointsDiscount,
        walletDiscount,
        totalDiscountAmount,
        totalAmount
      });

      return {
        success: true,
        message: 'Checkout calculado exitosamente',
        data: {
          subtotal,
          tax_amount: taxAmount,
          shipping_cost: shippingCost,
          discount_amount: totalDiscountAmount,
          coupon_discount: couponDiscount,
          points_discount: pointsDiscount,
          wallet_discount: walletDiscount,
          total_amount: totalAmount,
          estimated_delivery: this.getEstimatedDelivery(payload.delivery_description),
          available_points: 0, // TODO: Implementar sistema de puntos
          wallet_balance: 0 // TODO: Implementar sistema de wallet
        }
      };

    } catch (error: any) {
      console.error('❌ Error calculando checkout:', error.message);
      throw error;
    }
  }

  private calculateTax(subtotal: number, country?: string): number {
    // TODO: Implementar cálculo de impuestos basado en país
    const taxRate = country === 'MX' ? 0.16 : 0.08; // 16% para México, 8% para otros
    return subtotal * taxRate;
  }

  private calculateShippingCost(deliveryDescription: string, _address?: any): number {
    // TODO: Implementar cálculo de envío basado en método y dirección
    const shippingMethods = {
      'standard': 5.99,
      'express': 12.99,
      'overnight': 24.99,
      'free': 0
    };

    return shippingMethods[deliveryDescription as keyof typeof shippingMethods] || 5.99;
  }

  private async calculateCouponDiscount(coupon?: string | null, subtotal: number = 0): Promise<number> {
    if (!coupon) return 0;

    // TODO: Implementar validación de cupones
    console.log('🎫 Validando cupón:', coupon);
    
    // Simulación de descuento de cupón (10% del subtotal)
    return subtotal * 0.10;
  }

  private calculatePointsDiscount(usePoints: boolean, subtotal: number): number {
    if (!usePoints) return 0;

    // TODO: Implementar sistema de puntos
    console.log('⭐ Calculando descuento por puntos');
    
    // Simulación: 100 puntos = $1 de descuento
    const availablePoints = 500; // TODO: Obtener puntos del usuario
    const pointsValue = availablePoints / 100;
    const maxDiscount = subtotal * 0.20; // Máximo 20% del subtotal

    return Math.min(pointsValue, maxDiscount);
  }

  private calculateWalletDiscount(useWallet: boolean, subtotal: number): number {
    if (!useWallet) return 0;

    // TODO: Implementar sistema de wallet
    console.log('💳 Calculando descuento por wallet');
    
    // Simulación: $50 disponibles en wallet
    const walletBalance = 50;
    const maxDiscount = subtotal * 0.30; // Máximo 30% del subtotal

    return Math.min(walletBalance, maxDiscount);
  }

  private getEstimatedDelivery(deliveryDescription: string): string {
    const deliveryTimes = {
      'standard': '5-7 días hábiles',
      'express': '2-3 días hábiles',
      'overnight': '1 día hábil',
      'free': '5-7 días hábiles'
    };

    return deliveryTimes[deliveryDescription as keyof typeof deliveryTimes] || '5-7 días hábiles';
  }
} 