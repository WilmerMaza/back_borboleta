import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';
import mongoose from 'mongoose';

@injectable()
export class OrderController {
  constructor(
    @inject('OrderRepository') private orderRepository: OrderRepository,
    @inject('ProductRepository') private productRepository: ProductRepository
  ) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { items, shipping_address, billing_address, payment_method, notes, user_id, store_id } = req.body;

      console.log('🚀 Creando nueva orden:', { items, user_id, store_id });

      // Validar items
      if (!items || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'La orden debe tener al menos un producto'
        });
        return;
      }

      // Validar user_id
      if (!user_id) {
        res.status(400).json({
          success: false,
          message: 'El ID del usuario es requerido'
        });
        return;
      }

      // Validar que user_id sea un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        res.status(400).json({
          success: false,
          message: 'El ID del usuario debe ser un ObjectId válido (24 caracteres hexadecimales)'
        });
        return;
      }

      // Validar store_id
      if (!store_id) {
        res.status(400).json({
          success: false,
          message: 'El ID de la tienda es requerido'
        });
        return;
      }

      // Validar payment_method
      if (!payment_method) {
        res.status(400).json({
          success: false,
          message: 'El método de pago es requerido (ej: credit_card, debit_card, cash, transfer)'
        });
        return;
      }

      // Validar shipping_address
      if (!shipping_address) {
        res.status(400).json({
          success: false,
          message: 'La dirección de envío es requerida con todos los campos: name, email, phone, address, city, state, country, postal_code'
        });
        return;
      }

      // Validar campos requeridos de shipping_address
      const requiredShippingFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code'];
      const missingShippingFields = requiredShippingFields.filter(field => !shipping_address[field]);
      
      if (missingShippingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Campos faltantes en shipping_address: ${missingShippingFields.join(', ')}`
        });
        return;
      }

      // Validar billing_address
      if (!billing_address) {
        res.status(400).json({
          success: false,
          message: 'La dirección de facturación es requerida con todos los campos: name, email, phone, address, city, state, country, postal_code'
        });
        return;
      }

      // Validar campos requeridos de billing_address
      const requiredBillingFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'country', 'postal_code'];
      const missingBillingFields = requiredBillingFields.filter(field => !billing_address[field]);
      
      if (missingBillingFields.length > 0) {
        res.status(400).json({
          success: false,
          message: `Campos faltantes en billing_address: ${missingBillingFields.join(', ')}`
        });
        return;
      }

      // Validar que store_id sea un número
      if (isNaN(Number(store_id))) {
        res.status(400).json({
          success: false,
          message: 'El ID de la tienda debe ser un número válido'
        });
        return;
      }

      const storeIdNumber = Number(store_id);

      // Calcular totales
      let subtotal = 0;
      let total_amount = 0;
      const processedItems = [];

      for (const item of items) {
        console.log('🛍️ Procesando item:', item);

        // Validar que el item tenga product_id y quantity
        if (!item.product_id) {
          res.status(400).json({
            success: false,
            message: 'Cada item debe tener un product_id'
          });
          return;
        }

        if (!item.quantity || item.quantity < 1) {
          res.status(400).json({
            success: false,
            message: `La cantidad del item debe ser mayor a 0`
          });
          return;
        }

        // Validar que product_id sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(item.product_id)) {
          res.status(400).json({
            success: false,
            message: `El product_id debe ser un ObjectId válido: ${item.product_id}`
          });
          return;
        }

        // Obtener información del producto
        const product = await this.productRepository.findById(item.product_id);
        if (!product) {
          res.status(404).json({
            success: false,
            message: `Producto no encontrado con ID: ${item.product_id}`
          });
          return;
        }

        console.log('✅ Producto encontrado:', { name: product.name, price: product.price, discount: product.discount });

        // Calcular precios
        const price = product.price || 0;
        const discount = product.discount || 0;
        const sale_price = discount > 0 ? price - (price * discount / 100) : price;
        const item_total = sale_price * item.quantity;

        console.log('💰 Cálculos del item:', { price, discount, sale_price, quantity: item.quantity, item_total });

        processedItems.push({
          product_id: item.product_id,
          variation_id: item.variation_id,
          quantity: item.quantity,
          price: price,
          sale_price: sale_price,
          discount: discount,
          total: item_total
        } as any);

        subtotal += item_total;
      }

      // Calcular total final
      total_amount = subtotal;

      console.log('💰 Totales calculados:', { subtotal, total_amount });

      // Mapear las direcciones al formato correcto
      const mappedShippingAddress = {
        name: shipping_address.name || 'Cliente',
        email: shipping_address.email || 'cliente@example.com',
        phone: shipping_address.phone || '0000000000',
        address: shipping_address.street || shipping_address.address || 'Dirección no especificada',
        city: shipping_address.city,
        state: shipping_address.state,
        country: shipping_address.country,
        postal_code: shipping_address.zip_code || shipping_address.postal_code || '00000'
      };

      const mappedBillingAddress = {
        name: billing_address.name || 'Cliente',
        email: billing_address.email || 'cliente@example.com',
        phone: billing_address.phone || '0000000000',
        address: billing_address.street || billing_address.address || 'Dirección no especificada',
        city: billing_address.city,
        state: billing_address.state,
        country: billing_address.country,
        postal_code: billing_address.zip_code || billing_address.postal_code || '00000'
      };

      // Crear la orden con los datos procesados
      const orderData = {
        user_id,
        store_id: storeIdNumber,
        items: processedItems,
        total_amount,
        payment_method,
        shipping_address: mappedShippingAddress,
        billing_address: mappedBillingAddress,
        notes: notes || '',
        subtotal: subtotal
      };

      console.log('📝 Datos de la orden a crear:', orderData);

      const order = await this.orderRepository.create(orderData);

      console.log('✅ Orden creada exitosamente:', order.order_number);

      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: order
      });

    } catch (error: any) {
      console.error('❌ Error creando orden:', error);
      console.error('❌ Stack trace:', error.stack);
      
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
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
        stack: error.stack
      });
    }
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      const [orders, total] = await Promise.all([
        this.orderRepository.findAll({ skip, limit }),
        this.orderRepository.count()
      ]);
      
      res.status(200).json({
        success: true,
        message: 'Órdenes obtenidas exitosamente',
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error('❌ Error al obtener órdenes:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las órdenes'
      });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'El ID de la orden es requerido'
        });
        return;
      }

      const order = await this.orderRepository.findById(id);
      
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Orden obtenida exitosamente',
        data: order
      });
    } catch (error: any) {
      console.error('❌ Error al obtener orden:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener la orden'
      });
    }
  }

  async getOrdersByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'El ID del usuario es requerido'
        });
        return;
      }

      const orders = await this.orderRepository.findByUserId(userId);
      
      res.status(200).json({
        success: true,
        message: 'Órdenes del usuario obtenidas exitosamente',
        data: orders
      });
    } catch (error: any) {
      console.error('❌ Error al obtener órdenes del usuario:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las órdenes del usuario'
      });
    }
  }

  async getOrderByOrderNumber(req: Request, res: Response): Promise<void> {
    try {
      const { orderNumber } = req.params;
      
      if (!orderNumber) {
        res.status(400).json({
          success: false,
          message: 'El número de orden es requerido'
        });
        return;
      }

      const order = await this.orderRepository.findByOrderNumber(orderNumber);
      
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Orden obtenida exitosamente',
        data: order
      });
    } catch (error: any) {
      console.error('❌ Error al obtener orden por número:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener la orden'
      });
    }
  }
} 