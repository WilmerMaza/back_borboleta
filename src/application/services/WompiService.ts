import crypto from 'crypto';
import { injectable } from 'tsyringe';
import { wompiConfig } from '../../config/wompi';
import axios from 'axios';

@injectable()
export class WompiService {
  convertToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  convertFromCents(cents: number): number {
    return cents / 100;
      }

  generateReference(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 13; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
      }

  generateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string = wompiConfig.CURRENCY,
    expirationTime?: string
  ): string {
    if (!wompiConfig.INTEGRITY_SECRET) {
      throw new Error('WOMPI_INTEGRITY_SECRET no está configurado');
    }

    const amount = Math.floor(Number(amountInCents));

    // Construir base: reference + amountInCents + currency
    let base = `${reference}${amount}${currency}`;

    if (expirationTime) {
      base += expirationTime;
    }

    const stringToSign = `${base}${wompiConfig.INTEGRITY_SECRET}`;
    const signature = crypto
      .createHash('sha256')
      .update(stringToSign, 'utf8')
      .digest('hex');

    return signature;
  }

  generateExpirationTime(hoursFromNow: number = 1): string {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursFromNow);
    return expirationDate.toISOString();
  }

  /**
   * Verifica la firma del webhook de Wompi
   * @param _rawBody - El body RAW como Buffer (no se usa actualmente, pero se mantiene para futuras mejoras)
   * @param eventJson - El evento parseado como JSON
   * @returns true si la firma es válida
   */
  verifyWebhookSignature(_rawBody: Buffer, eventJson: any): boolean {
    try {
      if (!wompiConfig.EVENT_SECRET) {
        return false;
      }

      const signature = eventJson?.signature;
      if (!signature || !signature.properties || !signature.checksum) {
        return false;
      }

      if (!eventJson?.data?.transaction) {
        return false;
      }

      const chain = signature.properties
        .map((prop: string) => eventJson.data.transaction[prop] || '')
        .join('');

      const computed = crypto
        .createHmac('sha256', wompiConfig.EVENT_SECRET)
        .update(chain)
        .digest('hex');

      return computed === signature.checksum;
    } catch (error: any) {
      console.error('Error verificando firma Wompi:', error);
      return false;
    }
  }

  /**
   * Consulta el estado de una transacción directamente a la API de Wompi
   * @param reference - La referencia de la transacción
   * @returns El estado de la transacción o null si hay error
   */
  async getTransactionStatus(reference: string): Promise<{ status: string; transaction_id?: string } | null> {
    try {
      const url = `${wompiConfig.API_URL}/transactions/${reference}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${wompiConfig.PUBLIC_KEY}`
        },
        timeout: 10000
      });

      if (response.data && response.data.data) {
        const transaction = response.data.data;
        return {
          status: transaction.status,
          transaction_id: transaction.id
        };
      }

      return null;
    } catch (error: any) {
      console.error('Error al consultar transacción en Wompi:', error.message);
      return null;
    }
  }
}

