import { IUser } from '../entities/User';
import { IOrder } from '../entities/Order';

export interface IEmailService {
  /**
   * Envía un correo de bienvenida al usuario recién registrado
   * @param user Usuario que se acaba de registrar
   */
  sendWelcomeEmail(user: IUser): Promise<void>;

  /**
   * Envía un correo de confirmación de orden
   * @param order Orden que se acaba de crear
   * @param userEmail Email del usuario o invitado que realizó la orden
   */
  sendOrderConfirmationEmail(order: IOrder, userEmail: string): Promise<void>;
}
