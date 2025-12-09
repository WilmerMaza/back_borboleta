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
    const amount = Math.floor(Number(amountInCents));

    let base = `${reference}${amount}${currency}`;
    if (expirationTime) {
      base += expirationTime;
    }

    // Obtener el secreto y asegurarse de que esté limpio (sin espacios)
    const secret = wompiConfig.INTEGRITY_SECRET?.trim() || '';
    if (!secret) {
      console.error('❌ INTEGRITY_SECRET vacío o no configurado');
      throw new Error('INTEGRITY_SECRET no configurado');
    }

    // Logs detallados del secreto
    console.log('🔐 SECRET DEBUG:', {
      secretLength: secret.length,
      secretPreview: secret.substring(0, 20) + '...',
      secretEndsWith: secret.substring(secret.length - 10),
      expectedLength: wompiConfig.isSandbox ? 47 : 'variable',
      isSandbox: wompiConfig.isSandbox
    });

    // Construir el string exacto para la firma: <Referencia><Monto><Moneda><SecretoIntegridad>
    const stringToSign = `${base}${secret}`;

    console.log('🔗 STRING TO SIGN EXACTO:', {
      reference,
      amount,
      currency,
      expirationTime: expirationTime || 'no incluido',
      base,
      secretLength: secret.length,
      stringToSign: stringToSign, // String completo para verificar
      stringToSignLength: stringToSign.length,
      stringToSignEndsWith: stringToSign.substring(stringToSign.length - 20) // Últimos 20 caracteres (debe terminar en el secreto)
    });

    const signature = crypto
      .createHash('sha256')
      .update(stringToSign, 'utf8')
      .digest('hex');

    console.log('✅ SIGNATURE GENERADA:', {
      signature: signature,
      length: signature.length,
      preview: signature.substring(0, 20) + '...' + signature.substring(signature.length - 10)
    });
    
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

