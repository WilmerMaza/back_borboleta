import { injectable } from 'tsyringe';
import nodemailer, { Transporter } from 'nodemailer';
import mailgun from 'mailgun-js';
import { IEmailService } from '../../domain/interfaces/IEmailService';
import { IUser } from '../../domain/entities/User';
import { IOrder } from '../../domain/entities/Order';
import { emailConfig } from '../../config/email';
import { Logger } from '../../shared/utils/logger';
import { EmailTemplateRenderer } from './EmailTemplateRenderer';

@injectable()
export class EmailService implements IEmailService {
  private provider: 'smtp' | 'mailgun';
  private smtpTransporter?: Transporter;
  private mailgunClient?: mailgun.Mailgun;
  private fromEmail: string;
  private fromName: string;
  private appUrl: string;

  constructor() {
    this.provider = emailConfig.provider;
    this.fromEmail = emailConfig.fromEmail;
    this.fromName = emailConfig.fromName;
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';

    this.initializeProvider();
  }

  /**
   * Inicializa el proveedor de correo configurado
   */
  private initializeProvider(): void {
    if (this.provider === 'smtp' && emailConfig.smtp) {
      const smtpConfig = emailConfig.smtp;
      
      const transporterConfig: any = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.encryption === 'ssl',
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password,
        },
      };

      if (smtpConfig.encryption === 'tls') {
        transporterConfig.requireTLS = true;
      }

      this.smtpTransporter = nodemailer.createTransport(transporterConfig);
      Logger.log('EmailService: SMTP configurado correctamente');
    } else if (this.provider === 'mailgun' && emailConfig.mailgun) {
      this.mailgunClient = mailgun({
        apiKey: emailConfig.mailgun.secret,
        domain: emailConfig.mailgun.domain,
      });
      Logger.log('EmailService: Mailgun configurado correctamente');
    } else {
      Logger.error('EmailService: No hay configuración de correo válida');
    }
  }

  /**
   * Envía un correo usando el proveedor configurado
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    if (!to || !subject || !html) {
      throw new Error('Email, asunto y contenido son requeridos');
    }

    try {
      if (this.provider === 'smtp' && this.smtpTransporter) {
        await this.smtpTransporter.sendMail({
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to,
          subject,
          html,
        });
        Logger.log(`Email enviado vía SMTP a: ${to}`);
      } else if (this.provider === 'mailgun' && this.mailgunClient) {
        const mailgunData = {
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to,
          subject,
          html,
        };

        await this.mailgunClient.messages().send(mailgunData);
        Logger.log(`Email enviado vía Mailgun a: ${to}`);
      } else {
        throw new Error('No hay proveedor de correo configurado');
      }
    } catch (error: any) {
      Logger.error(`Error enviando email a ${to}:`, error);
      throw error;
    }
  }

  /**
   * Envía un correo de bienvenida al usuario recién registrado
   */
  async sendWelcomeEmail(user: IUser): Promise<void> {
    try {
      const html = EmailTemplateRenderer.render('welcome', {
        name: user.name,
        email: user.email,
        appUrl: this.appUrl,
      });

      await this.sendEmail(
        user.email,
        '¡Bienvenido a Borboleta!',
        html
      );

      Logger.log(`Correo de bienvenida enviado a: ${user.email}`);
    } catch (error: any) {
      Logger.error('Error enviando correo de bienvenida:', error);
      throw error;
    }
  }

  /**
   * Envía un correo de confirmación de orden
   */
  async sendOrderConfirmationEmail(
    order: IOrder,
    userEmail: string
  ): Promise<void> {
    try {
      // Formatear items de la orden para el template
      const itemsHtml = order.items
        .map(
          (item) => `
        <tr>
          <td>${item.name || 'Producto'}</td>
          <td>${item.quantity}</td>
          <td>${EmailTemplateRenderer.formatCurrency(item.sale_price || item.price)}</td>
          <td>${EmailTemplateRenderer.formatCurrency(item.total || (item.sale_price || item.price) * item.quantity)}</td>
        </tr>
      `
        )
        .join('');

      // Determinar texto del estado
      const statusTextMap: { [key: string]: string } = {
        pending: 'Pendiente',
        confirmed: 'Confirmada',
        processing: 'En Proceso',
        shipped: 'Enviada',
        delivered: 'Entregada',
        cancelled: 'Cancelada',
      };

      const orderStatusText = statusTextMap[order.status || 'pending'] || 'Pendiente';

      const html = EmailTemplateRenderer.render('order-confirmation', {
        customerName: order.customer_name || order.shipping_address?.name || 'Cliente',
        orderNumber: order.order_number || order.id || 'N/A',
        orderId: order.id || '',
        orderDate: EmailTemplateRenderer.formatDate(order.created_at || new Date()),
        orderStatus: order.status || 'pending',
        orderStatusText,
        paymentMethod: order.payment_method || 'N/A',
        items: itemsHtml,
        subtotal: EmailTemplateRenderer.formatCurrency(order.subtotal || 0),
        shippingCost: EmailTemplateRenderer.formatCurrency(order.shipping_cost || 0),
        taxAmount: EmailTemplateRenderer.formatCurrency(order.tax_amount || 0),
        discountAmount: order.discount_amount
          ? EmailTemplateRenderer.formatCurrency(order.discount_amount)
          : null,
        totalAmount: EmailTemplateRenderer.formatCurrency(order.total_amount || 0),
        shippingAddress: order.shipping_address || {
          name: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
        },
        trackingNumber: order.tracking_number || null,
        appUrl: this.appUrl,
      });

      await this.sendEmail(
        userEmail,
        `Confirmación de Orden #${order.order_number || order.id}`,
        html
      );

      Logger.log(`Correo de confirmación de orden enviado a: ${userEmail}`);
    } catch (error: any) {
      Logger.error('Error enviando correo de confirmación de orden:', error);
      throw error;
    }
  }
}
