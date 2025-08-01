import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';

import UserModel from '../../infrastructure/database/models/UserModel';


@injectable()
export class OrderController {
  constructor(
    @inject('OrderRepository') private orderRepository: OrderRepository,
  
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
      const items = products.map((p: any) => ({
        product_id: p.pivot?.product_id ?? p.product_id ?? p.id,
        variation_id: p.pivot?.variation_id ?? p.variation_id ?? null,
        quantity: p.pivot?.quantity ?? p.quantity ?? 1,
        name: p.name,
        price: p.pivot?.single_price ?? p.price ?? 0,
        sale_price: p.pivot?.sale_price ?? p.sale_price ?? p.pivot?.single_price ?? p.price ?? 0,
        total: p.pivot?.subtotal ?? p.sub_total ?? (p.pivot?.single_price ?? p.price ?? 0) * (p.pivot?.quantity ?? p.quantity ?? 1),
        image: p.image,
        sub_total: p.pivot?.subtotal ?? p.sub_total ?? 0
      }));



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
          status: 'pending',
          order_id: Date.now(), // Usar timestamp como ID temporal
          changed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        }]
      };

      const order = await this.orderRepository.create(orderData);

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

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 14;
      const skip = (page - 1) * limit;
      

      
      const [orders, total] = await Promise.all([
        this.orderRepository.findAll({ skip, limit }),
        this.orderRepository.count()
      ]);
      

  
      const ordersAdapted = await Promise.all(orders.map(async (order: any) => {
        console.log('🔍 Orden original:', {
          id: order.id,
          order_number: order.order_number,
          order_status_activities: order.order_status_activities
        });
        
        const user = order.user_id ? await UserModel.findOne({ id: order.user_id }) : null;
        const customerName = user ? user.name : '';
   
        const products = (order.items || []).map((item: any) => ({
          id: item.product_id,
          name: item.name,
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
            order_id: order.id ,
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
        // Adaptar direcciones
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
        // Adaptar consumer (mock)
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
        // Adaptar order_status y order_status_activities desde la base de datos
        const order_status = { id: 1, name: order.status || 'pending', sequence: 1, slug: order.status || 'pending' };
        console.log('🔍 Activities antes de procesar:', (order as any).order_status_activities);
        const order_status_activities = (order as any).order_status_activities && (order as any).order_status_activities.length > 0
          ? (order as any).order_status_activities
          : [{
              id: 1,
              status: order.status || 'pending',
              order_id: order.id || order._id || null,
              changed_at: order.created_at || '',
              created_at: order.created_at || '',
              updated_at: order.updated_at || '',
              deleted_at: null
            }];
        // Adaptar store (mock)
        const store = { id: order.store_id || null };
        return {
          id: order.id || order._id || null,
          order_number: order.order_number || null,
          consumer_id: order.user_id || null,
          tax_total: order.tax_amount || 0,
          shipping_total: order.shipping_cost || 0,
          points_amount: order.points_amount ?? 0,
          wallet_balance: order.wallet_balance ?? 0,
          amount: order.subtotal ,
          total: order.total_amount ,
          is_digital_only: 0,
          coupon_total_discount: order.discount_amount || 0,
          payment_method: order.payment_method || '',
          payment_status: (order.payment_status || 'pending').toUpperCase(),
          store_id: order.store_id || null,
          billing_address: adaptAddress(order.billing_address),
          shipping_address: adaptAddress(order.shipping_address),
          products,
          consumer,
          delivery_description: order.delivery_description || '',
          delivery_interval: order.delivery_interval || null,
          order_status_id: 1,
          coupon_id: order.coupon_id || null,
          parent_id: null,
          created_by_id: null,
          invoice_url: '',
          is_guest: 0,
          status: 1,
          note: order.notes || order.note || null,
          delivered_at: null,
          created_at: order.created_at ,
          updated_at: order.updated_at ,
          deleted_at: null,
          order_status,
          order_status_activities,
          store,
          customer_name: customerName,
          order_date: order.created_at || ''
        };
      }));
      const totalPages = Math.ceil(total / limit);
      

      
      res.status(200).json({
        current_page: page,
        data: ordersAdapted,
        first_page_url: "",
        from: skip + 1,
        totalPages: totalPages,
        last_page_url: "",
        links: [
          {
            url: null,
            label: "&laquo; Previous",
            active: false,
          },
          {
            url: "",
            label: page.toString(),
            active: true,
          },
          {
            url: null,
            label: "Next &raquo;",
            active: false,
          },
        ],
        next_page_url: null,
        path: "",
        per_page: limit,
        prev_page_url: null,
        to: skip + ordersAdapted.length,
        total: total,
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
      // Adaptar productos
      const user = order.user_id ? await UserModel.findOne({ id: order.user_id }) : null;
      const customerName = user ? user.name : '';
      // En el mapeo de productos en la respuesta de cada orden (en getOrders, getOrderById, getOrdersByUserId):
      // Usa directamente los valores del item guardado en la orden:
      const products = (order.items || []).map((item: any) => ({
        id: item.product_id,
        name: item.name,
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
      const ordersAdapted = await Promise.all(orders.map(async (order: any) => {
        // (Misma adaptación que en getOrders)
        const user = order.user_id ? await UserModel.findOne({ id: order.user_id }) : null;
        const customerName = user ? user.name : '';
        // En el mapeo de productos en la respuesta de cada orden (en getOrders, getOrderById, getOrdersByUserId):
        // Usa directamente los valores del item guardado en la orden:
        const products = (order.items || []).map((item: any) => ({
          id: item.product_id,
          name: item.name,
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
            order_id: order.id || order._id || null,
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
              order_id: order.id || (order as any)._id || null,
              changed_at: order.created_at || '',
              created_at: order.created_at || '',
              updated_at: order.updated_at || '',
              deleted_at: null
            }];
        const store = { id: order.store_id || null };
        return {
          id: order.id || order._id || null,
          order_number: order.order_number || null,
          consumer_id: order.user_id || null,
          tax_total: order.tax_amount || 0,
          shipping_total: order.shipping_cost || 0,
          points_amount: order.points_amount || 0,
          wallet_balance: order.wallet_balance || 0,
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
          delivery_description: order.delivery_description || '',
          delivery_interval: order.delivery_interval || null,
          order_status_id: 1,
          coupon_id: order.coupon_id || null,
          parent_id: null,
          created_by_id: null,
          invoice_url: '',
          is_guest: 0,
          status: 1,
          note: order.notes || order.note || null,
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
      }));
      res.status(200).json({
        current_page: 1,
        data: ordersAdapted,
        first_page_url: "",
        from: 1,
        last_page: 1,
        last_page_url: "",
        links: [
          {
            url: null,
            label: "&laquo; Previous",
            active: false,
          },
          {
            url: "",
            label: "1",
            active: true,
          },
          {
            url: null,
            label: "Next &raquo;",
            active: false,
          },
        ],
        next_page_url: null,
        path: "",
        per_page: ordersAdapted.length,
        prev_page_url: null,
        to: ordersAdapted.length,
        total: ordersAdapted.length,
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