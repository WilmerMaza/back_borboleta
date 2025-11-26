/**
 * Configuración de Wompi
 * Variables de entorno requeridas:
 * - WOMPI_PUBLIC_KEY: Clave pública de Wompi
 * - WOMPI_INTEGRITY_KEY: Secreto de integridad para firmas (también acepta WOMPI_INTEGRITY_SECRET)
 * - WOMPI_EVENT_SECRET: Secreto para verificación de webhooks/eventos (líneas 79-80 del .env)
 * - WOMPI_ENV: 'test' o 'prod' (opcional, por defecto 'test')
 * - WOMPI_REDIRECT_URL: URL de redirección después del pago (opcional)
 */

export interface WompiConfig {
  PUBLIC_KEY: string;
  INTEGRITY_SECRET: string;
  EVENT_SECRET: string; // Para verificación de webhooks (usualmente es el mismo que INTEGRITY_SECRET)
  ENV: 'test' | 'prod';
  API_URL: string;
  CURRENCY: string;
  COUNTRY: string;
  REDIRECT_URL?: string;
  isSandbox: boolean;
}

// Validar variables de entorno
const validateWompiConfig = (): void => {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY || process.env.WOMPI_INTEGRITY_SECRET;
  
  if (!publicKey || !integrityKey) {
    const missing = [];
    if (!publicKey) missing.push('WOMPI_PUBLIC_KEY');
    if (!integrityKey) missing.push('WOMPI_INTEGRITY_KEY o WOMPI_INTEGRITY_SECRET');
    
    console.warn(`⚠️ Advertencia: Faltan variables de entorno de Wompi: ${missing.join(', ')}`);
    console.warn('⚠️ La integración de Wompi no funcionará correctamente sin estas variables.');
  }
};

// Configuración de Wompi
// Acepta tanto WOMPI_INTEGRITY_KEY como WOMPI_INTEGRITY_SECRET para compatibilidad
const integritySecret = process.env.WOMPI_INTEGRITY_KEY || process.env.WOMPI_INTEGRITY_SECRET || '';
// WOMPI_EVENT_SECRET está en las líneas 79-80 del .env
const eventSecret = process.env.WOMPI_EVENT_SECRET || integritySecret;

export const wompiConfig: WompiConfig = {
  PUBLIC_KEY: process.env.WOMPI_PUBLIC_KEY || '',
  INTEGRITY_SECRET: integritySecret,
  EVENT_SECRET: eventSecret, // Variable de eventos de Wompi (líneas 79-80 del .env)
  ENV: (process.env.WOMPI_ENV as 'test' | 'prod') || 'test',
  API_URL: process.env.WOMPI_ENV === 'prod' 
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1',
  CURRENCY: 'COP',
  COUNTRY: 'CO',
  REDIRECT_URL: process.env.WOMPI_REDIRECT_URL || undefined,
  isSandbox: process.env.WOMPI_ENV !== 'prod'
};

// Validar al cargar el módulo
validateWompiConfig();

// Log de configuración (sin mostrar secretos completos)
if (wompiConfig.PUBLIC_KEY && wompiConfig.INTEGRITY_SECRET) {
  console.log('✅ Configuración de Wompi cargada:', {
    ENV: wompiConfig.ENV,
    API_URL: wompiConfig.API_URL,
    CURRENCY: wompiConfig.CURRENCY,
    PUBLIC_KEY: wompiConfig.PUBLIC_KEY.substring(0, 20) + '...',
    INTEGRITY_SECRET: wompiConfig.INTEGRITY_SECRET.substring(0, 10) + '...',
    EVENT_SECRET: wompiConfig.EVENT_SECRET ? wompiConfig.EVENT_SECRET.substring(0, 10) + '...' : 'No configurado',
    REDIRECT_URL: wompiConfig.REDIRECT_URL || 'No configurada'
  });
}

