import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import mongoose from 'mongoose';

@injectable()
export class CartController {
  constructor(
    @inject('CartRepository') private cartRepository: ICartRepository,
    @inject('ProductRepository') private productRepository: IProductRepository
  ) {}

  // Función helper para formatear producto con imágenes
  private formatProductWithImages(product: any) {
    return {
      ...product,
      // Campos de imagen explícitos para el frontend
      product_thumbnail: product.product_thumbnail_id,
      product_galleries: product.product_galleries_id || [],
      watermark_image: product.watermark_image_id,
      size_chart_image: product.size_chart_image_id,
      product_meta_image: product.product_meta_image_id,
      preview_audio_file: product.preview_audio_file_id,
      preview_video_file: product.preview_video_file_id
    };
  }

  async getCart(req: Request, res: Response): Promise<void> {
    try {
   
      let user_id = req.headers['user-id'] as string;
      
      if (!user_id) {
        
        console.log('⚠️ No se proporcionó user-id, creando uno temporal');

      }

    
      let validUserId = user_id;
      if (!mongoose.Types.ObjectId.isValid(user_id)) {

        console.log('⚠️ User ID no es un ObjectId válido, creando uno temporal:', user_id);

      }

      console.log('🛒 Obteniendo carrito para usuario:', user_id);

      const cart = await this.cartRepository.findByUserId(validUserId);
      
      if (!cart) {
        // Devolver carrito vacío si no existe
        res.status(200).json({
          success: true,
          message: 'Carrito obtenido exitosamente',
          data: {
            items: [],
            total: 0,
            is_digital_only: false
          }
        });
        return;
      }

     
      const total = cart.items.reduce((sum: number, item: any) => sum + (item.sub_total || 0), 0);
   
      const isDigitalOnly = cart.items.length > 0 && cart.items.every((item: any) => {
    
        return !item.variation_id;
      });


      const formattedItems = cart.items.map((item: any) => ({
        id: item._id || item.id || Math.floor(Math.random() * 1000000),
        product_id: item.numeric_id,
        variation: item.variation || {},
        variation_id: item.variation_id || null,
        wholesale_price: item.wholesale_price || null,
        consumer_id: item.consumer_id,
        quantity: item.quantity,
        sub_total: item.sub_total,
        product: item.product ? this.formatProductWithImages(item.product) : {},
        created_by_id: item.created_by_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at
      }));

      console.log('🛒 Carrito formateado:', {
        itemsCount: formattedItems.length,
        total,
        isDigitalOnly
      });

      res.status(200).json({
        success: true,
        message: 'Carrito obtenido exitosamente',
        data: {
          items: formattedItems,
          total,
          is_digital_only: isDigitalOnly
        }
      });

    } catch (error: any) {
      console.error('❌ Error al obtener carrito:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener el carrito'
      });
    }
  }

  // POST /api/cart - Agregar producto al carrito
  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const { product_id, variation_id, quantity } = req.body;
      let user_id = req.headers['user-id'] as string; // Obtener desde headers

      console.log('🛒 Agregando al carrito:', { user_id, product_id, variation_id, quantity });

      // Si no hay user_id, usar uno temporal (opcional)
      if (!user_id) {
        console.log('ℹ️ No se proporcionó user-id, usando uno temporal');
        user_id = 'temp_' + Date.now();
      }

      // Usar el user_id directamente ya que viene como string desde el frontend
      let validUserId = user_id;

      if (!product_id) {
        res.status(400).json({
          success: false,
          message: 'El product_id es requerido'
        });
        return;
      }

      if (!quantity || quantity < 1) {
        res.status(400).json({
          success: false,
          message: 'La cantidad debe ser mayor a 0'
        });
        return;
      }

      // Validar que product_id sea un número válido
      console.log('🔍 Validando product_id:', { 
        product_id, 
        type: typeof product_id
      });
      
      if (!product_id) {
        res.status(400).json({
          success: false,
          message: 'El product_id es requerido'
        });
        return;
      }

      // Verificar que product_id sea un número
      const numericProductId = Number(product_id);
      if (isNaN(numericProductId) || numericProductId <= 0) {
        res.status(400).json({
          success: false,
          message: `El product_id debe ser un número válido mayor a 0. Valor recibido: "${product_id}" (tipo: ${typeof product_id})`
        });
        return;
      }

      // Obtener información del producto usando numeric_id
      const product = await this.productRepository.findByNumericId(numericProductId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
        return;
      }

      console.log('✅ Producto encontrado:', { name: product.name, price: product.price, discount: product.discount, numeric_id: product.numeric_id });

      // Calcular precios
      const price = product.price || 0;
      const discount = product.discount || 0;
      const sale_price = discount > 0 ? price - (price * discount / 100) : price;
      const total = sale_price * quantity;

      console.log('💰 Cálculos del item:', { price, discount, sale_price, quantity, total });

      // Crear item del carrito
      const cartItem = {
        numeric_id: product.numeric_id,
        product_id: product.numeric_id, // numeric_id del producto
        variation: null,
        variation_id: variation_id || null,
        quantity: quantity,
        sub_total: total,
        product: this.formatProductWithImages(product),
        created_by_id: null
      };

      // Agregar al carrito
      const updatedCart = await this.cartRepository.addItem(validUserId, cartItem);

      console.log('✅ Producto agregado al carrito exitosamente');

      if (!updatedCart) {
        res.status(500).json({
          success: false,
          message: 'Error al actualizar el carrito'
        });
        return;
      }

      // Calcular total
      const cartTotal = updatedCart.items.reduce((sum: number, item: any) => sum + (item.sub_total || 0), 0);
      
      // Verificar si es digital only
      const isDigitalOnly = updatedCart.items.length > 0 && updatedCart.items.every((item: any) => {
        return !item.variation_id;
      });

      // Formatear items para la respuesta
      const formattedItems = updatedCart.items.map((item: any) => ({
        id: item._id || item.id || Math.random().toString(36).substr(2, 9),
        product_id: item.numeric_id, // Enviar numeric_id como product_id
        variation_id: item.variation_id || null,
        wholesale_price: item.wholesale_price || null,
        consumer_id: item.consumer_id,
        quantity: item.quantity,
        sub_total: item.sub_total,
        product: item.product ? this.formatProductWithImages(item.product) : {},
        variation: item.variation || {},
        created_by_id: item.created_by_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at
      }));

      res.status(200).json({
        success: true,
        message: 'Producto agregado al carrito exitosamente',
        data: {
          items: formattedItems,
          total: cartTotal,
          is_digital_only: isDigitalOnly
        }
      });

    } catch (error: any) {
      console.error('❌ Error al agregar al carrito:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al agregar producto al carrito'
      });
    }
  }

  // PUT /api/cart/{cart_item_id} - Actualizar cantidad de un producto
  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const { cart_item_id } = req.params;
      const { quantity } = req.body;
      let user_id = req.headers['user-id'] as string; // Obtener desde headers

      console.log('🛒 Actualizando cantidad:', { user_id, cart_item_id, quantity });

      // Si no hay user_id, usar uno temporal (opcional)
      if (!user_id) {
        console.log('ℹ️ No se proporcionó user-id, usando uno temporal');
        user_id = 'temp_' + Date.now();
      }

      // Usar el user_id directamente ya que viene como string desde el frontend
      let validUserId = user_id;

      if (!cart_item_id) {
        res.status(400).json({
          success: false,
          message: 'El cart_item_id es requerido'
        });
        return;
      }

      if (quantity === undefined || quantity < 0) {
        res.status(400).json({
          success: false,
          message: 'La cantidad debe ser mayor o igual a 0'
        });
        return;
      }

      // Actualizar cantidad
      const updatedCart = await this.cartRepository.updateItem(validUserId, cart_item_id, quantity);

      if (!updatedCart) {
        res.status(404).json({
          success: false,
          message: 'Item del carrito no encontrado'
        });
        return;
      }

      console.log('✅ Cantidad actualizada exitosamente');

      // Calcular total
      const updateTotal = updatedCart.items.reduce((sum: number, item: any) => sum + (item.sub_total || 0), 0);
      
      // Verificar si es digital only
      const updateIsDigitalOnly = updatedCart.items.length > 0 && updatedCart.items.every((item: any) => {
        return !item.variation_id;
      });

      // Formatear items para la respuesta
      const updateFormattedItems = updatedCart.items.map((item: any) => ({
        id: item._id || item.id || Math.random().toString(36).substr(2, 9),
        product_id: item.numeric_id, // Enviar numeric_id como product_id
        variation_id: item.variation_id || null,
        wholesale_price: item.wholesale_price || null,
        consumer_id: item.consumer_id,
        quantity: item.quantity,
        sub_total: item.sub_total,
        product: item.product ? this.formatProductWithImages(item.product) : {},
        variation: item.variation || {},
        created_by_id: item.created_by_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at
      }));

      res.status(200).json({
        success: true,
        message: 'Cantidad actualizada exitosamente',
        data: {
          items: updateFormattedItems,
          total: updateTotal,
          is_digital_only: updateIsDigitalOnly
        }
      });

    } catch (error: any) {
      console.error('❌ Error al actualizar cantidad:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar cantidad'
      });
    }
  }

  // DELETE /api/cart/{cart_item_id} - Eliminar producto del carrito
  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const { cart_item_id } = req.params;
      let user_id = req.headers['user-id'] as string; // Obtener desde headers

      console.log('🛒 Eliminando del carrito:', { user_id, cart_item_id });

      // Si no hay user_id, usar uno temporal (opcional)
      if (!user_id) {
        console.log('ℹ️ No se proporcionó user-id, usando uno temporal');
        user_id = 'temp_' + Date.now();
      }

      // Usar el user_id directamente ya que viene como string desde el frontend
      let validUserId = user_id;

      if (!cart_item_id) {
        res.status(400).json({
          success: false,
          message: 'El cart_item_id es requerido'
        });
        return;
      }

      // Eliminar item
      const updatedCart = await this.cartRepository.removeItem(validUserId, cart_item_id);

      if (!updatedCart) {
        res.status(404).json({
          success: false,
          message: 'Item del carrito no encontrado'
        });
        return;
      }

      console.log('✅ Producto eliminado del carrito exitosamente');

      // Calcular total
      const removeTotal = updatedCart.items.reduce((sum: number, item: any) => sum + (item.sub_total || 0), 0);
      
      // Verificar si es digital only
      const removeIsDigitalOnly = updatedCart.items.length > 0 && updatedCart.items.every((item: any) => {
        return !item.variation_id;
      });

      // Formatear items para la respuesta
      const removeFormattedItems = updatedCart.items.map((item: any) => ({
        id: item._id || item.id || Math.random().toString(36).substr(2, 9),
        product_id: item.numeric_id, // Enviar numeric_id como product_id
        variation_id: item.variation_id || null,
        wholesale_price: item.wholesale_price || null,
        consumer_id: item.consumer_id,
        quantity: item.quantity,
        sub_total: item.sub_total,
        product: item.product ? this.formatProductWithImages(item.product) : {},
        variation: item.variation || {},
        created_by_id: item.created_by_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at
      }));

      res.status(200).json({
        success: true,
        message: 'Producto eliminado del carrito exitosamente',
        data: {
          items: removeFormattedItems,
          total: removeTotal,
          is_digital_only: removeIsDigitalOnly
        }
      });

    } catch (error: any) {
      console.error('❌ Error al eliminar del carrito:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar producto del carrito'
      });
    }
  }

  // DELETE /api/cart - Vaciar el carrito
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      let user_id = req.headers['user-id'] as string; // Obtener desde headers

      console.log('🛒 Vaciando carrito:', user_id);

      // Si no hay user_id, crear uno temporal
      if (!user_id) {
        console.log('⚠️ No se proporcionó user-id, creando uno temporal');
        user_id = new mongoose.Types.ObjectId().toString();
      }

      // Validar que user_id sea un ObjectId válido o crear uno temporal
      let validUserId = user_id;
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        // Si no es un ObjectId válido, crear uno temporal para desarrollo
        console.log('⚠️ User ID no es un ObjectId válido, creando uno temporal:', user_id);
        validUserId = new mongoose.Types.ObjectId().toString();
      }

      // Vaciar carrito
      const success = await this.cartRepository.clearCart(validUserId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Carrito no encontrado'
        });
        return;
      }

      console.log('✅ Carrito vaciado exitosamente');

      res.status(200).json({
        success: true,
        message: 'Carrito vaciado exitosamente',
        data: {
          items: [],
          total: 0,
          is_digital_only: false
        }
      });

    } catch (error: any) {
      console.error('❌ Error al vaciar carrito:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al vaciar el carrito'
      });
    }
  }
} 