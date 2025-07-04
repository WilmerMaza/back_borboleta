import { injectable, inject } from 'tsyringe';
import { CreateOrderCommand } from '../../commands/order/CreateOrderCommand';
import { OrderRepository } from '../../../infrastructure/repositories/OrderRepository';
import { ProductRepository } from '../../../infrastructure/repositories/ProductRepository';
import { IOrder, IOrderItem } from '../../../domain/entities/Order';



@injectable()
export class CreateOrderHandler {
  constructor(
    @inject('OrderRepository') private orderRepository: OrderRepository,
    @inject('ProductRepository') private productRepository: ProductRepository
  ) {}

  async handle(command: CreateOrderCommand): Promise<IOrder> {
    const orderData = command.data;
    console.log('🛒 Datos recibidos en el handler:', orderData);

    // Validar datos requeridos
    if (!orderData.user_id) {
      throw new Error('El ID del usuario es requerido');
    }
    if (!orderData.store_id) {
      throw new Error('El ID de la tienda es requerido');
    }
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('La orden debe tener al menos un producto');
    }
    if (!orderData.payment_method) {
      throw new Error('El método de pago es requerido');
    }
    if (!orderData.shipping_address) {
      throw new Error('La dirección de envío es requerida');
    }
    if (!orderData.billing_address) {
      throw new Error('La dirección de facturación es requerida');
    }

    // Validar y calcular items
    const validatedItems: IOrderItem[] = [];
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of orderData.items) {
      // Validar producto
      const product = await this.productRepository.findById(item.product_id);
      if (!product) {
        throw new Error(`Producto con ID '${item.product_id}' no encontrado`);
      }

      // Validar cantidad
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`La cantidad del producto '${product.name}' debe ser mayor a 0`);
      }

      // Usar datos del producto si no se proporcionan
      const price = item.price || product.price || 0;
      const salePrice = item.sale_price || product.sale_price || price;
      const discount = item.discount || 0;

      // Calcular total del item
      const itemTotal = salePrice * item.quantity;
      const itemDiscount = (price - salePrice) * item.quantity;

      validatedItems.push({
        product_id: item.product_id,
        variation_id: item.variation_id,
        quantity: item.quantity,
        price: price,
        sale_price: salePrice,
        discount: discount,
        total: itemTotal
      });

      subtotal += itemTotal;
      totalDiscount += itemDiscount;
    }

    // Calcular totales
    const taxAmount = orderData.tax_amount || 0;
    const shippingCost = orderData.shipping_cost || 0;
    const discountAmount = orderData.discount_amount || totalDiscount;
    const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

    // Crear objeto de orden con datos calculados
    const orderToCreate: Partial<IOrder> = {
      user_id: orderData.user_id,
      store_id: orderData.store_id,
      items: validatedItems,
      subtotal: subtotal,
      tax_amount: taxAmount,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      payment_method: orderData.payment_method,
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
      notes: orderData.notes,
      status: orderData.status || 'pending',
      payment_status: orderData.payment_status || 'pending'
    };

    console.log('🛒 Orden calculada:', {
      subtotal,
      taxAmount,
      shippingCost,
      discountAmount,
      totalAmount
    });

    // Crear la orden
    const order = await this.orderRepository.create(orderToCreate);
    
    return order;
  }
} 