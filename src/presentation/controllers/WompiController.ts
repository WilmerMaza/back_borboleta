import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { WompiService } from '../../application/services/WompiService';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { PendingOrderRepository } from '../../infrastructure/repositories/PendingOrderRepository';
import { AddressRepository } from '../../infrastructure/repositories/AddressRepository';
import { AuthenticatedRequest } from '../../middleware/auth';
import { wompiConfig } from '../../config/wompi';
import UserModel from '../../infrastructure/database/models/UserModel';

// Interfaces opcionales para tipado
interface WidgetDataRequestBody {
  products: any[];
  shipping_address: any;
  billing_address: any;
  shipping_cost?: number;
  tax_amount?: number;
  discount_amount?: number;
  subtotal?: number;
  total?: number;
  coupon?: any;
  delivery_description?: string;
  delivery_interval?: string;
  notes?: string;
  points_amount?: number;
  wallet_balance?: number;
}

/**
 * Controlador para la integración con Wompi
 * Maneja la creación de órdenes, generación de datos del widget y webhooks
 */
@injectable()
export class WompiController {
  constructor(
    @inject('WompiService') private wompiService: WompiService,
    @inject('OrderRepository') private orderRepository: OrderRepository,
    @inject('PendingOrderRepository') private pendingOrderRepository: PendingOrderRepository,
    @inject('AddressRepository') private addressRepository: AddressRepository
  ) {}

  /**
   * POST /api/wompi/widget-data
   * Calcula totales, crea PendingOrder y devuelve TODOS los datos para el widget
   */
  async generateWidgetData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const body = req.body as WidgetDataRequestBody;
      const {
        products,
        shipping_address,
        billing_address,
        shipping_cost = 0,
        tax_amount = 0,
        discount_amount = 0,
        subtotal,
        total,
        coupon,
        delivery_description,
        delivery_interval,
        notes,
        points_amount,
        wallet_balance
      } = body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        res.status(400).json({
          success: false,
          message: 'products es requerido y debe ser un array con al menos un producto'
        });
        return;
      }

      if (!shipping_address || !billing_address) {
        res.status(400).json({
          success: false,
          message: 'shipping_address y billing_address son requeridos'
        });
        return;
      }

      // Buscar usuario
      const user = await UserModel.findOne({ id: req.user.userId });
      if (!user) {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }

      // Mapear items
      const items = products.map((p: any) => {
        // El frontend puede enviar product_id directamente o dentro de un objeto product
        const productId = p.product_id || p.product?.id || p.id;
        const productName = p.name || p.product?.name || `Producto ${productId}`;
        const productPrice = p.single_price || p.price || p.product?.price || 0;
        const quantity = p.quantity ?? 1;
        
        return {
          product_id: productId,
          variation_id: p.variation_id || p.variation?.id || null,
          quantity: quantity,
          name: productName,
          price: productPrice,
          sale_price: productPrice,
          discount: p.discount || 0,
          total: productPrice * quantity,
          image: p.image || p.product?.image || null,
          sub_total: productPrice * quantity
        };
      });

      const calculatedSubtotal =
        subtotal ?? items.reduce((acc: number, item: any) => acc + (item.sub_total || 0), 0);

      const calculatedTotal =
        total ?? calculatedSubtotal + shipping_cost + tax_amount - discount_amount;

      if (calculatedTotal <= 0) {
        res.status(400).json({
          success: false,
          message: 'El total debe ser mayor a 0'
        });
        return;
      }

      const store_id = products[0]?.store_id || 1;

      const reference = this.wompiService.generateReference(); // 🔐 referencia usada para firma
      const expirationTime = this.wompiService.generateExpirationTime(1);
      const expiresAt = new Date(expirationTime);

      await this.pendingOrderRepository.create({
        reference,
        user_id: req.user.userId.toString(),
        store_id,
        items,
        total_amount: calculatedTotal,
        subtotal: calculatedSubtotal,
        shipping_cost,
        tax_amount,
        discount_amount,
        shipping_address,
        billing_address,
        coupon: coupon || null,
        delivery_description: delivery_description || '',
        delivery_interval: delivery_interval || '',
        notes: notes || '',
        points_amount: typeof points_amount === 'number' ? points_amount : (points_amount === false ? 0 : Number(points_amount) || 0),
        wallet_balance: typeof wallet_balance === 'number' ? wallet_balance : (wallet_balance === false ? 0 : Number(wallet_balance) || 0),
        expires_at: expiresAt
      });

      const amountInCents = this.wompiService.convertToCents(calculatedTotal);
      const vatInCents = this.wompiService.convertToCents(tax_amount);
      const consumptionTaxInCents = 0;

      // Asegurar que amountInCents sea un número entero
      const amountInCentsInt = Math.floor(amountInCents);

      // Generar firma INCLUYENDO expiration_time (porque lo estamos usando en el widget)
      const signatureIntegrity = this.wompiService.generateIntegritySignature(
        reference,
        amountInCentsInt,
        wompiConfig.CURRENCY,
        expirationTime // Ya está declarado arriba
      );

      const userPhone = user.phone ? String(user.phone).replace(/\D/g, '') : '';
      const shippingPhone = shipping_address.phone ? String(shipping_address.phone).replace(/\D/g, '') : '';

      const customerData = {
        email: user.email,
        fullName: user.name || shipping_address.name || billing_address.name,
        phoneNumber: userPhone || shippingPhone || '',
        phoneNumberPrefix: `+${user.country_code || 57}`,
        legalId: shipping_address.pincode || billing_address.pincode || '',
        legalIdType: 'CC'
      };

      const wompiShippingAddress = {
        addressLine1: shipping_address.street || shipping_address.address || '',
        addressLine2: '',
        country: 'CO',
        city: shipping_address.city || '',
        phoneNumber: shippingPhone || userPhone,
        region: '', // opcional
        name: shipping_address.title || customerData.fullName
      };

      const redirectUrl =
        wompiConfig.REDIRECT_URL ||
        `http://localhost:4200/account/order?reference=${reference}`;

      res.status(200).json({
        success: true,
        data: {
          publicKey: wompiConfig.PUBLIC_KEY,
          currency: wompiConfig.CURRENCY,
          amountInCents: amountInCentsInt,
          reference,
          signatureIntegrity, // Campo principal
          signature: signatureIntegrity, // Alias para compatibilidad con frontend
          redirectUrl,
          expirationTime,
          taxes: {
            vat: vatInCents,
            consumption: consumptionTaxInCents
          },
          customerData,
          shippingAddress: wompiShippingAddress,
          pendingOrder: true
        }
      });
    } catch (error: any) {
      console.error('Error al generar datos del widget:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar datos del widget'
      });
    }
  }

  /**
   * POST /api/wompi/webhook
   * Maneja los webhooks de Wompi para actualizar el estado de los pagos
   * 
   * Wompi envía notificaciones cuando cambia el estado de una transacción
   * IMPORTANTE: Este endpoint recibe el body como RAW Buffer
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // El body viene como Buffer RAW (configurado en index.ts)
      const rawBody = req.body as Buffer;
      const textBody = rawBody.toString('utf8');
      const eventJson = JSON.parse(textBody);

      // Validar firma del webhook
      const isValidSignature = this.wompiService.verifyWebhookSignature(rawBody, eventJson);
      
      if (!isValidSignature && process.env.NODE_ENV === 'production') {
        console.error('⚠️ Webhook con firma inválida');
        res.status(401).json({
          success: false,
          message: 'Firma inválida'
        });
        return;
      }

      // Extraer información de la transacción
      const tx = eventJson.data?.transaction || eventJson.data || eventJson;
      const transactionId = tx.id || tx.transaction_id;
      const status = tx.status;
      const reference = tx.reference;

      if (!reference) {
        res.status(400).json({
          success: false,
          message: 'Reference no encontrado en el webhook'
        });
        return;
      }

      // Buscar la orden pendiente por reference
      const pendingOrder = await this.pendingOrderRepository.findByReference(reference);

      // CAMINO B: Si no existe orden pendiente, buscar directamente en orders
      if (!pendingOrder) {
        const existingOrder = await this.orderRepository.findOrderByReference(reference);

        if (existingOrder && existingOrder.id) {
          if (status === 'APPROVED' && existingOrder.payment_status === 'pending') {
            await this.orderRepository.update(existingOrder.id, {
              payment_status: 'paid',
              status: 'confirmed',
              payment_reference: reference,
              notes: `${existingOrder.notes || ''}\n[WOMPI_TX:${transactionId}]\n[WOMPI_STATUS:${status}]\n[UPDATED_VIA:webhook_camino_b]`
            });
            res.status(200).json({ success: true, message: 'Orden actualizada a paid' });
            return;
          } else if (existingOrder.payment_status === 'paid') {
            res.status(200).json({ success: true, message: 'Orden ya procesada' });
            return;
          }
        }

        res.status(200).json({ success: true, message: 'Sin acción - Orden no encontrada' });
        return;
      }

      switch (status) {
        case 'APPROVED':
          try {
            const addresses = await this.addressRepository.findByUserId(Number(pendingOrder.user_id));
            const shippingAddressId = (pendingOrder.shipping_address as any)?.id || (pendingOrder.shipping_address as any);
            const billingAddressId = (pendingOrder.billing_address as any)?.id || (pendingOrder.billing_address as any);
            const shipping = addresses.find((a: any) => a.id === shippingAddressId);
            const billing = addresses.find((a: any) => a.id === billingAddressId);
            
            if (!shipping || !billing) {
              throw new Error("No se encontraron direcciones completas para la orden");
            }

            const user = await UserModel.findOne({ id: Number(pendingOrder.user_id) });
            const userEmail = user?.email || '';

            const orderData: any = {
              user_id: pendingOrder.user_id,
              store_id: pendingOrder.store_id,
              items: pendingOrder.items,
              total_amount: pendingOrder.total_amount,
              status: 'confirmed' as const,
              payment_method: 'wompi',
              shipping_address: {
                _id: (shipping as any)._id,
                name: shipping.title,
                email: userEmail,
                phone: String(shipping.phone || ''),
                address: shipping.street,
                city: shipping.city,
                state: String(shipping.state_id || ''),
                country: String(shipping.country_code || 'CO'),
                postal_code: shipping.pincode
              },
              billing_address: {
                _id: (billing as any)._id,
                name: billing.title,
                email: userEmail,
                phone: String(billing.phone || ''),
                address: billing.street,
                city: billing.city,
                state: String(billing.state_id || ''),
                country: String(billing.country_code || 'CO'),
                postal_code: billing.pincode
              },
              payment_reference: reference, // Campo dedicado para la referencia de Wompi
              notes: pendingOrder.notes 
                ? `${pendingOrder.notes}\n[WOMPI_REFERENCE:${reference}]\n[WOMPI_TX:${transactionId}]\n[WOMPI_STATUS:${status}]`
                : `[WOMPI_REFERENCE:${reference}]\n[WOMPI_TX:${transactionId}]\n[WOMPI_STATUS:${status}]`,
              shipping_cost: pendingOrder.shipping_cost,
              tax_amount: pendingOrder.tax_amount,
              discount_amount: pendingOrder.discount_amount,
              subtotal: pendingOrder.subtotal,
              payment_status: 'paid' as const,
              coupon: pendingOrder.coupon || null,
              delivery_description: pendingOrder.delivery_description || '',
              delivery_interval: pendingOrder.delivery_interval || '',
              points_amount: pendingOrder.points_amount || 0,
              wallet_balance: pendingOrder.wallet_balance || 0,
              payment_mode: 'wompi',
              order_status_activities: [{
                id: 1,
                status: 'confirmed' as const,
                order_id: Date.now(),
                changed_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              }]
            };

            await this.orderRepository.create(orderData);
            await this.pendingOrderRepository.delete(reference);
          } catch (createError: any) {
            console.error('Error al crear la orden:', createError);
            throw createError;
          }
          break;

        case 'DECLINED':
        case 'VOIDED':
          await this.pendingOrderRepository.delete(reference);
          break;

        case 'PENDING':
          // No hacer nada, esperar confirmación
          break;
      }

      // Responder 200 para confirmar a Wompi que recibimos el webhook
      res.status(200).json({
        success: true,
        message: 'Webhook procesado correctamente'
      });

    } catch (error: any) {
      console.error('Error al procesar webhook de Wompi:', error);
      res.status(200).json({
        success: false,
        message: error.message || 'Error al procesar webhook'
      });
    }
  }

  /**
   * GET /api/wompi/verify/:reference
   * Verifica el estado de una transacción después del redirect de Wompi
   * Solo consulta el estado, NO crea la orden (eso lo hace el webhook)
   * 
   * El frontend llama a este endpoint después de que el usuario es redirigido
   * para verificar si la orden ya fue creada por el webhook
   */
  async verifyTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { reference } = req.params;
      const { status } = req.query; // El frontend puede pasar el status del redirect

      if (!reference) {
        res.status(400).json({
          success: false,
          message: 'Reference es requerido'
        });
        return;
      }

      // Primero buscar si ya existe una orden creada
      const orders = await this.orderRepository.findAll({ skip: 0, limit: 1000 });
      const order = orders.find((o: any) => 
        o.notes && o.notes.includes(`[WOMPI_REFERENCE:${reference}]`)
      );
        
      if (order) {
        // Orden ya creada
        const transactionIdMatch = order.notes?.match(/WOMPI_TRANSACTION_ID:([^\s\]]+)/);
        const transactionId = transactionIdMatch ? transactionIdMatch[1] : null;

        const statusMatch = order.notes?.match(/WOMPI_STATUS:([^\s\]]+)/);
        const wompiStatus = statusMatch ? statusMatch[1] : null;

      res.status(200).json({
        success: true,
        data: {
            orderId: order.id,
            orderNumber: order.order_number,
            reference,
            transactionId,
            paymentStatus: order.payment_status,
            orderStatus: order.status,
            wompiStatus,
            amount: order.total_amount,
          currency: wompiConfig.CURRENCY,
            isPending: false
          }
        });
        return;
      }

      // Si no existe orden, buscar orden pendiente
      const pendingOrder = await this.pendingOrderRepository.findByReference(reference);

      if (!pendingOrder) {
        // No hay orden creada ni pendiente
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada (ni creada ni pendiente). El webhook puede no haber llegado aún.'
        });
        return;
      }

      // Hay una orden pendiente, pero aún no se ha creado la orden final
      // Esto significa que el webhook aún no ha llegado o no se ha procesado
      const statusFromQuery = (status as string)?.toUpperCase();
      
      res.status(200).json({
        success: true,
        data: {
          reference,
          paymentStatus: 'pending',
          orderStatus: 'pending',
          wompiStatus: statusFromQuery || 'PENDING',
          amount: pendingOrder.total_amount,
          currency: wompiConfig.CURRENCY,
          isPending: true,
          message: statusFromQuery 
            ? `El pago tiene status: ${statusFromQuery}. Esperando webhook de Wompi para crear la orden.`
            : 'El pago está pendiente. Esperando webhook de Wompi para crear la orden.'
        }
      });

    } catch (error: any) {
      console.error('Error al verificar transacción:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Error al verificar transacción'
      });
    }
  }


  /**
   * GET /api/wompi/pending-orders
   * Endpoint de prueba para verificar órdenes pendientes (solo desarrollo)
   */
  async getPendingOrders(_req: Request, res: Response): Promise<void> {
    try {
      // Solo en desarrollo
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          message: 'Este endpoint solo está disponible en desarrollo'
        });
        return;
      }

      // Buscar todas las órdenes pendientes (esto requiere agregar un método al repositorio)
      // Por ahora, solo respondemos que el endpoint existe
          res.status(200).json({
            success: true,
        message: 'Endpoint de prueba - Revisa los logs del servidor para ver las órdenes pendientes'
      });
    } catch (error: any) {
      console.error('Error al obtener órdenes pendientes:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Error al obtener órdenes pendientes'
      });
    }
  }
}

