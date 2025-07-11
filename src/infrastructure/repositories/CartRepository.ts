import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';

import CartModel from '../database/models/CartModel';
import { injectable } from 'tsyringe';

@injectable()
export class CartRepository implements ICartRepository {
  async create(cart: Partial<Cart>): Promise<Cart> {
    try {
      console.log('🛒 Datos recibidos en el repositorio de carrito:', cart);
      
      const newCart = new CartModel(cart);
      console.log('🛒 Carrito creado:', newCart);
      
      const savedCart = await newCart.save();
      console.log('🛒 Carrito guardado:', savedCart);
      
      const cartObj = savedCart.toObject();
      return {
        ...cartObj,
        id: cartObj._id.toString()
      };
    } catch (error) {
      console.error('❌ Error en CartRepository.create:', error);
      throw new Error('Error al crear el carrito en la base de datos');
    }
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    try {
      const cart = await CartModel.findOne({ user_id: userId });
      
      if (!cart) return null;
      
      const cartObj = cart.toObject();
      return {
        ...cartObj,
        id: cartObj._id.toString()
      };
    } catch (error) {
      console.error('❌ Error en CartRepository.findByUserId:', error);
      throw new Error('Error al obtener el carrito de la base de datos');
    }
  }

  async update(userId: string, cart: Partial<Cart>): Promise<Cart | null> {
    try {
      const updatedCart = await CartModel.findOneAndUpdate(
        { user_id: userId },
        cart,
        { new: true }
      );
      
      if (!updatedCart) return null;
      
      const cartObj = updatedCart.toObject();
      return {
        ...cartObj,
        id: cartObj._id.toString()
      };
    } catch (error) {
      console.error('❌ Error in CartRepository.update:', error);
      throw new Error('Error al actualizar el carrito en la base de datos');
    }
  }

  async delete(userId: string): Promise<boolean> {
    try {
      const result = await CartModel.findOneAndDelete({ user_id: userId });
      return !!result;
    } catch (error) {
      console.error('❌ Error en CartRepository.delete:', error);
      throw new Error('Error al eliminar el carrito de la base de datos');
    }
  }

  async addItem(userId: string, item: any): Promise<Cart | null> {
    try {
      console.log('🛒 Agregando item al carrito:', { userId, item });
      
      // Buscar el carrito del usuario
      let cart = await CartModel.findOne({ user_id: userId });
      
      if (!cart) {
        // Crear nuevo carrito si no existe
        cart = new CartModel({
          user_id: userId,
          items: [],
          total_amount: 0,
          subtotal: 0
        });
      }

      // Verificar si el producto ya existe en el carrito
      const existingItemIndex = cart.items.findIndex(
        (cartItem: any) => 
          cartItem.numeric_id === item.numeric_id &&
          cartItem.variation_id?.toString() === item.variation_id?.toString()
      );

      if (existingItemIndex !== -1) {
        // Actualizar cantidad si el producto ya existe
        const oldQuantity = cart.items[existingItemIndex].quantity;
        const newQuantity = oldQuantity + item.quantity;
        cart.items[existingItemIndex].quantity = newQuantity;
        
        // Recalcular sub_total basado en el precio unitario
        const unitPrice = cart.items[existingItemIndex].sub_total / oldQuantity;
        cart.items[existingItemIndex].sub_total = unitPrice * newQuantity;
        
        console.log('🛒 Producto existente, cantidad actualizada:', { oldQuantity, newQuantity, unitPrice });
      } else {
        // Agregar nuevo item
        cart.items.push(item);
        console.log('🛒 Nuevo producto agregado al carrito');
      }

      const savedCart = await cart.save();
      console.log('🛒 Carrito actualizado:', savedCart);
      
      const cartObj = savedCart.toObject();
      return {
        ...cartObj,
        id: cartObj._id.toString()
      };
    } catch (error) {
      console.error('❌ Error en CartRepository.addItem:', error);
      throw new Error('Error al agregar item al carrito');
    }
  }

  async updateItem(userId: string, itemId: string, quantity: number): Promise<Cart | null> {
    try {
      console.log('🛒 Actualizando cantidad del item:', { userId, itemId, quantity });
      
      const cart = await CartModel.findOne({ user_id: userId });
      
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      console.log('🛒 Carrito encontrado con items:', cart.items.map((item: any) => ({
        _id: item._id.toString(),
        product_id: item.product_id.toString(),
        quantity: item.quantity
      })));

      const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId);
      
      if (itemIndex === -1) {
        console.log('❌ Item no encontrado. IDs disponibles:', cart.items.map((item: any) => item._id.toString()));
        throw new Error(`Item con ID '${itemId}' no encontrado en el carrito`);
      }

      if (quantity <= 0) {
        // Eliminar item si la cantidad es 0 o menor
        cart.items.splice(itemIndex, 1);
        console.log('🛒 Item eliminado por cantidad 0');
      } else {
        // Actualizar cantidad
        const oldQuantity = cart.items[itemIndex].quantity;
        cart.items[itemIndex].quantity = quantity;
        
        // Recalcular sub_total basado en el precio unitario
        const unitPrice = cart.items[itemIndex].sub_total / oldQuantity;
        cart.items[itemIndex].sub_total = unitPrice * quantity;
        
        console.log('🛒 Cantidad actualizada:', { oldQuantity, newQuantity: quantity, unitPrice });
      }

      const savedCart = await cart.save();
      console.log('🛒 Carrito actualizado:', savedCart);
      
      const cartObj = savedCart.toObject();
      return {
        ...cartObj,
        id: cartObj._id.toString()
      };
    } catch (error) {
      console.error('❌ Error en CartRepository.updateItem:', error);
      throw new Error('Error al actualizar item del carrito');
    }
  }

  async removeItem(userId: string, itemId: string): Promise<Cart | null> {
    try {
      console.log('🛒 Eliminando item del carrito:', { userId, itemId });
      
      const cart = await CartModel.findOne({ user_id: userId });
      
      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      console.log('🛒 Carrito encontrado con items:', cart.items.map((item: any) => ({
        _id: item._id.toString(),
        product_id: item.product_id.toString(),
        quantity: item.quantity
      })));

      const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId);
      
      if (itemIndex === -1) {
        console.log('❌ Item no encontrado. IDs disponibles:', cart.items.map((item: any) => item._id.toString()));
        throw new Error(`Item con ID '${itemId}' no encontrado en el carrito`);
      }

      cart.items.splice(itemIndex, 1);
      console.log('🛒 Item eliminado del carrito');

      const savedCart = await cart.save();
      console.log('🛒 Carrito actualizado:', savedCart);
      
      const cartObj = savedCart.toObject();
      return {
        ...cartObj,
        id: cartObj._id.toString()
      };
    } catch (error) {
      console.error('❌ Error en CartRepository.removeItem:', error);
      throw new Error('Error al eliminar item del carrito');
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      console.log('🛒 Vaciamiento carrito:', userId);
      
      const cart = await CartModel.findOne({ user_id: userId });
      
      if (!cart) {
        return true; // Carrito ya está vacío
      }

      cart.items = [];
      await cart.save();
      
      console.log('🛒 Carrito vaciado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en CartRepository.clearCart:', error);
      throw new Error('Error al vaciar el carrito');
    }
  }
} 