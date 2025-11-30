import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { AuthenticatedRequest } from '../../middleware/auth';
import UserModel from '../../infrastructure/database/models/UserModel';


@injectable()
export class OrderController {
  constructor(
    @inject('OrderRepository') private orderRepository: OrderRepository
  ) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        consumer_id,
        products,
        shipping_address,
        billing_address,
        coupon,
        points_amount,
        wallet_balance,
        delivery_description,
        delivery_interval,
        payment_method,
        notes,
        tracking_number,
        estimated_delivery,
        shipping_cost,
        tax_amount,
        total,
        sub_total,
        tax_total,
        shipping_total,
        coupon_total_discount
      } = req.body;

      // Mapear products a items, guardando todos los campos enviados en el payload y agregando sale_price y total requeridos por el modelo

      const items = products.map((p: any) => {
       
        return {
        product_id: p.pivot?.product_id ?? p.product_id ?? p.id,
        variation_id: p.pivot?.variation_id ?? p.variation_id ?? null,
        quantity: p.pivot?.quantity ?? p.quantity ?? 1,
        name: p.name || p.product?.name || `Producto ${p.pivot?.product_id ?? p.product_id ?? p.id}`,
        price: p.pivot?.single_price ?? p.price ?? 0,
        sale_price: p.pivot?.sale_price ?? p.sale_price ?? p.pivot?.single_price ?? p.price ?? 0,
        total: p.pivot?.subtotal ?? p.sub_total ?? (p.pivot?.single_price ?? p.price ?? 0) * (p.pivot?.quantity ?? p.quantity ?? 1),
        image: p.image,
        sub_total: p.pivot?.subtotal ?? p.sub_total ?? 0
        };
      });



      // Usar el descuento del frontend o calcularlo
      let discount_amount = coupon_total_discount || items.reduce((acc: number, item: any) => {
        if (item.price && item.sale_price) {
          return acc + ((item.price - item.sale_price) * item.quantity);
        }
        if (item.discount) {
          return acc + (item.discount * item.quantity);
        }
        return acc;
      }, 0);
      if (coupon && coupon.discount_value && !coupon_total_discount) {
        discount_amount += coupon.discount_value;
      }

      // Usar los totales del frontend en lugar de calcularlos
      let subtotal = sub_total || items.reduce((acc: number, item: any) => acc + (item.sub_total || 0), 0);
      let total_amount = total || subtotal + (shipping_cost || 0) + (tax_amount || 0) - (discount_amount || 0);

      // Debug: Log de los totales
      console.log('🔍 Debug totales:', {
        total_from_frontend: total,
        sub_total_from_frontend: sub_total,
        calculated_subtotal: subtotal,
        calculated_total_amount: total_amount,
        shipping_cost,
        tax_amount,
        discount_amount
      });

      // Obtener store_id del primer producto (asumiendo que todos los productos son de la misma tienda)
      const store_id = products[0]?.store_id || 1;

      // Armar el objeto para crear la orden con todos los campos del modelo
      const orderData = {
        user_id: consumer_id,
        store_id,
        items,
        total_amount,
        status: 'pending' as 'pending',
        payment_method,
        shipping_address,
        billing_address,
        notes: notes || '',
        tracking_number: tracking_number || '',
        estimated_delivery: estimated_delivery || null,
        shipping_cost: shipping_total || shipping_cost || 0,
        tax_amount: tax_total || tax_amount || 0,
        discount_amount,
        subtotal,
        payment_status: 'pending' as 'pending',
        coupon: coupon || null,
        delivery_description: delivery_description || '',
        delivery_interval: delivery_interval || '',
        points_amount: points_amount || 0,
        wallet_balance: wallet_balance || 0,
        order_status_activities: [{
          id: 1,
          status: 'pending' as const,
          order_id: Date.now(), // Usar timestamp como ID temporal
          changed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        }]
      };

      const order = await this.orderRepository.create(orderData);

      // Debug: Log de la orden creada
      console.log('🔍 Orden creada:', {
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        updated_at: order.updated_at,
        total_amount: order.total_amount
      });

      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: order
      });
      return;
    } catch (error: any) {
      console.error('❌ Error creando orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
        stack: error.stack
      });
      return;
    }
  }

  async getUserOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const userId = req.user.userId.toString();
      const orders = await this.orderRepository.findByUserId(userId);
      
      if (!orders || orders.length === 0) {
        res.status(200).json({
          success: true,
          message: 'No se encontraron órdenes para este usuario',
          data: []
        });
        return;
      }

      // Adaptar las órdenes al formato esperado por el frontend
      const ordersAdapted = await Promise.all(orders.map(async (order: any) => {
        const user = order.user_id ? await UserModel.findOne({ id: order.user_id }) : null;
        const customerName = user ? user.name : '';

        const products = (order.items || []).map((item: any) => ({
          id: item.product_id,
          name: item.product?.name || item.name || `Producto ${item.product_id}`,
          price: item.price || item.product?.price || 0,
          sale_price: item.sale_price || item.product?.sale_price || 0,
          total: item.total || (item.quantity * (item.sale_price || item.price || item.product?.sale_price || item.product?.price || 0)),
          is_return: 0,
          product_thumbnail_id: null,
          can_review: false,
          order_amount: item.total,
          is_wishlist: false,
          rating_count: 0,
          review_ratings: [0,0,0,0,0],
          // Campos de refund status para el producto
          refund_status: order.payment_status === 'refunded' ? 'refunded' : 'none',
          is_refundable: order.payment_status === 'paid' && order.status !== 'cancelled',
          related_products: [],
          cross_sell_products: [],
          pivot: {
            order_id: order.id || order._id || null,
            wholesale_price: 0,
            variation: item.variation_id || null,
            quantity: item.quantity,
            single_price: item.sale_price || item.price || item.product?.sale_price || item.product?.price || 0,
            shipping_cost: 0,
            refund_status: order.payment_status === 'refunded' ? 'refunded' : 'none',
            product_id: item.product_id,
            product_type: 'physical',
            subtotal: item.total || item.sub_total || 0
          },
          wholesales: [],
          variations: [],
          product_thumbnail: null,
          product_galleries: [],
          attributes: [],
          tags: [],
          categories: [],
          reviews: [],
          wishlist: [],
          cart: [],
          compare: [],
          related: [],
          cross_sell: [],
          up_sell: [],
          meta_title: null,
          meta_description: null,
          meta_keywords: null,
          slug: null,
          sku: null,
          barcode: null,
          weight: '',
          length: '',
          width: '',
          height: '',
          stock_quantity: null,
          stock_status: 'instock',
          is_featured: false,
          is_digital: false,
          is_virtual: false,
          is_downloadable: false,
          download_limit: -1,
          download_expiry: -1,
          tax_class: '',
          tax_status: 'taxable',
          shipping_class: '',
          shipping_status: null,
          manage_stock: false,
          backorders: 'no',
          sold_individually: false,
          purchase_note: '',
          menu_order: 0,
          status: 'publish',
          visibility: 'visible',
          featured_image: null,
          gallery_images: [],
          product_url: null,
          button_text: null,
          external_url: null,
          product_type: 'simple',
          virtual: false,
          downloadable: false,
          downloads: [],
          image: null,
          gallery: [],
          default_attributes: [],
          meta_data: [],
          reviews_allowed: true,
          average_rating: '0.00',
          related_ids: [],
          upsell_ids: [],
          cross_sell_ids: [],
          parent_id: 0,
          images: [],
          has_options: false,
          post_password: '',
          post_content_filtered: '',
          post_parent: 0,
          post_mime_type: '',
          comment_count: 0,
          filter: 'raw'
        }));

        const adaptedOrder = {
          id: order.id || order._id || null,
          order_id: order.id || order._id || null,
          order_number: order.order_number || null,
          amount: order.total_amount || 0,
          consumer_id: order.user_id || null,
          consumer: {
            id: order.user_id || null,
            name: customerName,
            role: null,
            email: '',
            phone: '',
            point: null,
            status: 1,
            wallet: null,
            created_at: '',
            country_code: '',
            orders_count: 0,
            created_by_id: null,
            profile_image: null,
            system_reserve: '0',
            profile_image_id: null,
            email_verified_at: ''
          },
          consumer_name: customerName,
          guest_order: order.is_guest ? {
            id: order.user_id || null,
            name: customerName,
            email: '',
            phone: ''
          } : null,
          store_id: order.store_id || null,
          store: {
            id: order.store_id || null,
            name: order.store_name || '',
            description: order.store_description || '',
            logo: order.store_logo || '',
            banner: order.store_banner || '',
            address: order.store_address || '',
            phone: order.store_phone || '',
            email: order.store_email || '',
            status: order.store_status || true
          },
          products: products,
          // Refund status principal
          refund_status: order.payment_status === 'refunded' ? 'refunded' : 'none',
          is_refundable: order.payment_status === 'paid' && order.status !== 'cancelled',
          refund_amount: order.payment_status === 'refunded' ? order.total_amount : 0,
          notes: order.notes || '',
          tracking_number: order.tracking_number || '',
          estimated_delivery: order.estimated_delivery || null,
          shipping_cost: order.shipping_cost || 0,
          tax_amount: order.tax_amount || 0,
          discount_amount: order.discount_amount || 0,
          subtotal: order.subtotal || 0,
          // Campos adicionales que el frontend puede necesitar
          tax_total: order.tax_amount || 0,
          shipping_total: order.shipping_cost || 0,
          coupon_total_discount: order.discount_amount || 0,
          // Campos adicionales según la interfaz del frontend
          order_status_activities: order.order_status_activities || [],
          coupon_id: order.coupon_id || null,
          coupon: order.coupon || null,
          billing_address_id: order.billing_address_id || null,
          billing_address: order.billing_address || null,
          shipping_address_id: order.shipping_address_id || null,
          shipping_address: order.shipping_address || null,
          delivery_interval: order.delivery_interval || '',
          order_status_id: order.order_status_id || 1,
          order_status: {
            id: order.order_status_id || 1,
            name: order.status || 'pending',
            sequence: 1,
            slug: order.status || 'pending'
          },
          parent_id: order.parent_id || null,
          payment_method: order.payment_method || '',
          payment_status: order.payment_status || 'pending',
          payment_mode: order.payment_mode || order.payment_method || '',
          order_payment_status: order.order_payment_status || order.payment_status || 'pending',
          delivery_description: order.delivery_description || '',
          sub_orders: order.sub_orders || [],
          total: order.total_amount || 0,
          points_amount: order.points_amount || 0,
          wallet_balance: order.wallet_balance || 0,
          transactions: order.transactions || [],
          invoice_url: order.invoice_url || '',
          is_digital_only: order.is_digital_only || false,
          status: order.status !== 'cancelled',
          created_by_id: order.created_by_id || null,
          deleted_at: order.deleted_at || null,
          created_at: order.created_at || '',
          updated_at: order.updated_at || ''
        };

        return adaptedOrder;
      }));

      res.status(200).json({
        success: true,
        message: 'Órdenes del usuario obtenidas exitosamente',
        data: ordersAdapted
      });
    } catch (error: any) {
      console.error('❌ Error al obtener órdenes del usuario:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener las órdenes del usuario'
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
      // Adaptar productos
      const user = order.user_id ? await UserModel.findOne({ id: order.user_id }) : null;
      const customerName = user ? user.name : '';
      // En el mapeo de productos en la respuesta de cada orden (en getOrders, getOrderById, getOrdersByUserId):
      // Usa directamente los valores del item guardado en la orden:
      const products = (order.items || []).map((item: any) => ({
        id: item.product_id,
        name: item.product?.name || item.name || `Producto ${item.product_id}`,
        price: item.price,
        sale_price: item.sale_price,
        total: item.total,
        is_return: 0,
        product_thumbnail_id: null,
        can_review: false,
        order_amount: item.total,
        is_wishlist: false,
        rating_count: null,
        review_ratings: [0,0,0,0,0],
        related_products: [],
        cross_sell_products: [],
        pivot: {
          order_id: order.id  || null,
          wholesale_price: 0,
          variation: item.variation_id || null,
          quantity: item.quantity,
          single_price: item.price || item.sale_price || 0,
          shipping_cost: 0,
          refund_status: null,
          product_id: item.product_id,
          product_type: 'physical',
          subtotal: item.total || item.sub_total || 0
        },
        wholesales: [],
        variations: [],
        product_thumbnail: null,
        product_galleries: [],
        attributes: [],
        brand: null,
        wishlist: [],
        reviews: []
      }));
      const adaptAddress = (address: any) => address ? {
        id: address.id || null,
        city: address.city || '',
        phone: address.phone || '',
        state: address.state || null,
        title: address.title || '',
        street: address.address || '',
        country: address.country || null,
        pincode: address.postal_code || address.pincode || '',
        user_id: address.user_id || '',
        state_id: address.state_id || null,
        country_id: address.country_id || null,
        is_default: address.is_default || 0,
        country_code: address.country_code || ''
      } : null;
      const consumer = order.user_id ? {
        id: order.user_id,
        name: '',
        role: null,
        email: '',
        phone: '',
        point: null,
        status: 1,
        wallet: null,
        created_at: '',
        country_code: '',
        orders_count: 0,
        created_by_id: null,
        profile_image: null,
        system_reserve: '0',
        profile_image_id: null,
        email_verified_at: ''
      } : null;
      const order_status = { id: 1, name: order.status || 'pending', sequence: 1, slug: order.status || 'pending' };
      const order_status_activities = (order as any).order_status_activities && (order as any).order_status_activities.length > 0
        ? (order as any).order_status_activities
        : [{
            id: 1,
            status: order.status || 'pending',
            order_id: order.id || null,
            changed_at: order.created_at || '',
            created_at: order.created_at || '',
            updated_at: order.updated_at || '',
            deleted_at: null
          }];
      const store = { id: order.store_id || null };
      const orderAdapted = {
        id: order.id || order.id || null,
        order_number: order.order_number || null,
        consumer_id: order.user_id || null,
        tax_total: order.tax_amount || 0,
        shipping_total: order.shipping_cost || 0,
        points_amount: order || 0,
        wallet_balance: order || 0,
        amount: order.subtotal || 0,
        total: order.total_amount || 0,
        is_digital_only: 0,
        coupon_total_discount: order.discount_amount || 0,
        payment_method: order.payment_method || '',
        payment_status: (order.payment_status || 'pending').toUpperCase(),
        store_id: order.store_id || null,
        billing_address: adaptAddress(order.billing_address),
        shipping_address: adaptAddress(order.shipping_address),
        products,
        consumer,
        delivery_description: order || '',
        delivery_interval: order || null,
        order_status_id: 1,
        coupon_id: order || null,
        parent_id: null,
        created_by_id: null,
        invoice_url: '',
        is_guest: 0,
        status: 1,
        note: order.notes || order || null,
        delivered_at: null,
        created_at: order.created_at || '',
        updated_at: order.updated_at || '',
        deleted_at: null,
        order_status,
        order_status_activities,
        store,
        customer_name: customerName,
        order_date: order.created_at || ''
      };
      res.status(200).json({
        data: orderAdapted
      });
    } catch (error: any) {
      console.error('❌ Error al obtener orden:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener la orden'
      });
    }
  }


  async getOrderByOrderNumber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

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

      // Verificar que la orden pertenece al usuario autenticado
      if (order.user_id !== req.user.userId.toString()) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a esta orden'
        });
        return;
      }

      console.log('🔍 Orden completa:', order);
      console.log('🔍 Items de la orden:', order.items);
      
      // Procesar la orden de la misma manera que los otros métodos
      const user = order.user_id ? await UserModel.findOne({ id: order.user_id }) : null;
      const customerName = user ? user.name : '';
   
      const products = (order.items || []).map((item: any) => {
        console.log('🔍 Item individual completo:', JSON.stringify(item, null, 2));
        console.log('🔍 item.product:', item.product);
        console.log('🔍 item.product?.name:', item.product?.name);
        console.log('🔍 item.name:', item.name);
        const productName = item.name || `Producto ${item.product_id}`;
        console.log('🔍 Nombre del producto final:', productName);
        
        return {
          id: item.product_id,
          name: productName,
          price: item.price,
          sale_price: item.sale_price,
          total: item.total,
          is_return: 0,
          product_thumbnail_id: null,
          can_review: false,
          order_amount: item.total,
          is_wishlist: false,
          rating_count: null,
          review_ratings: [0,0,0,0,0],
          related_products: [],
          cross_sell_products: [],
          pivot: {
            order_id: order.id || (order as any)._id || null,
            wholesale_price: 0,
            variation: item.variation_id || null,
            quantity: item.quantity,
            single_price: item.price || item.sale_price || 0,
            shipping_cost: 0,
            refund_status: null,
            product_id: item.product_id,
            product_type: 'physical',
            subtotal: item.total || item.sub_total || 0
          },
          wholesales: [],
          variations: [],
          product_thumbnail: null,
          product_galleries: [],
          attributes: [],
          brand: null,
          wishlist: [],
          reviews: []
        };
      });

      const adaptAddress = (address: any) => address ? {
        id: address.id || null,
        city: address.city || '',
        phone: address.phone || '',
        state: address.state || null,
        title: address.title || '',
        street: address.address || '',
        country: address.country || null,
        pincode: address.postal_code || address.pincode || '',
        user_id: address.user_id || '',
        state_id: address.state_id || null,
        country_id: address.country_id || null,
        is_default: address.is_default || 0,
        country_code: address.country_code || ''
      } : null;

      const consumer = order.user_id ? {
        id: order.user_id,
        name: '',
        role: null,
        email: '',
        phone: '',
        point: null,
        status: 1,
        wallet: null,
        created_at: '',
        country_code: '',
        orders_count: 0,
        created_by_id: null,
        profile_image: null,
        system_reserve: '0',
        profile_image_id: null,
        email_verified_at: ''
      } : null;

      const order_status = { id: 1, name: order.status || 'pending', sequence: 1, slug: order.status || 'pending' };
      
      const order_status_activities = (order as any).order_status_activities && (order as any).order_status_activities.length > 0
        ? (order as any).order_status_activities
        : [{
            id: 1,
            status: order.status || 'pending',
            order_id: order.id || (order as any)._id || null,
            changed_at: order.created_at || '',
            created_at: order.created_at || '',
            updated_at: order.updated_at || '',
            deleted_at: null
          }];

      const store = { id: order.store_id || null };

      const orderAdapted = {
        id: order.id || (order as any)._id || null,
        order_number: order.order_number || null,
        consumer_id: order.user_id || null,
        tax_total: order.tax_amount || 0,
        shipping_total: order.shipping_cost || 0,
        points_amount: (order as any).points_amount || 0,
        wallet_balance: (order as any).wallet_balance || 0,
        amount: order.subtotal || 0,
        total: order.total_amount || 0,
        is_digital_only: 0,
        coupon_total_discount: order.discount_amount || 0,
        payment_method: order.payment_method || '',
        payment_status: (order.payment_status || 'pending').toUpperCase(),
        store_id: order.store_id || null,
        billing_address: adaptAddress(order.billing_address),
        shipping_address: adaptAddress(order.shipping_address),
        products,
        consumer,
        delivery_description: (order as any).delivery_description || '',
        delivery_interval: (order as any).delivery_interval || null,
        order_status_id: 1,
        coupon_id: (order as any).coupon_id || null,
        parent_id: null,
        created_by_id: null,
        invoice_url: '',
        is_guest: 0,
        status: 1,
        note: order.notes || (order as any).note || null,
        delivered_at: null,
        created_at: order.created_at || '',
        updated_at: order.updated_at || '',
        deleted_at: null,
        order_status,
        order_status_activities,
        store,
        customer_name: customerName,
        order_date: order.created_at || ''
      };
      
      res.status(200).json({
        success: true,
        message: 'Orden obtenida exitosamente',
        data: orderAdapted
      });
    } catch (error: any) {
      console.error('❌ Error al obtener orden por número:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener la orden'
      });
    }
  }

  /**
   * GET /api/orders/by-temp/:tempId
   * Obtiene la orden por temp_id (busca primero en órdenes reales, luego en temporales)
   */
  async getOrderByTempId(req: Request, res: Response): Promise<void> {
    try {
      const { tempId } = req.params;

      if (!tempId) {
        res.status(400).json({
          success: false,
          message: 'El temp_id es requerido'
        });
        return;
      }

      console.log('🔍 Buscando orden por temp_id:', tempId);

      // 1️⃣ Buscar primero en órdenes reales (por si ya fue creada)
      let order = await this.orderRepository.findByOrderNumber(tempId) || 
                  await this.orderRepository.findById(tempId);

      if (order) {
        console.log('✅ Orden real encontrada:', order.id);
        res.status(200).json({
          success: true,
          data: order,
          is_temporary: false
        });
        return;
      }

      // 2️⃣ No se encontró la orden
      res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });

    } catch (error: any) {
      console.error('❌ Error al obtener orden por temp_id:', error.message);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener la orden'
      });
    }
  }
} 