import { Cart } from '../entities/Cart';

export interface ICartRepository {
  create(cart: Partial<Cart>): Promise<Cart>;
  findByUserId(userId: string): Promise<Cart | null>;
  update(userId: string, cart: Partial<Cart>): Promise<Cart | null>;
  delete(userId: string): Promise<boolean>;
  addItem(userId: string, item: any): Promise<Cart | null>;
  updateItem(userId: string, itemId: string, quantity: number): Promise<Cart | null>;
  removeItem(userId: string, itemId: string): Promise<Cart | null>;
  clearCart(userId: string): Promise<boolean>;
} 