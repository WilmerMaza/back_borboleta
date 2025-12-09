/**
 * Configuración de Wompi
 * Variables de entorno requeridas:
 * 
 * Para TEST (sufijo _test):
 * - WOMPI_PUBLIC_KEY_TEST: Clave pública de Wompi para test
 * - WOMPI_INTEGRITY_KEY_TEST: Secreto de integridad para firmas en test (también acepta WOMPI_INTEGRITY_SECRET_TEST)
 * - WOMPI_EVENTS_KEY_TEST: Secreto para verificación de webhooks/eventos en test
 * 
 * Para PRODUCCIÓN (sin sufijo):
 * - WOMPI_PUBLIC_KEY: Clave pública de Wompi para producción
 * - WOMPI_INTEGRITY_KEY: Secreto de integridad para firmas en producción (también acepta WOMPI_INTEGRITY_SECRET)
 * - WOMPI_EVENTS_KEY: Secreto para verificación de webhooks/eventos en producción
 * 
 * Comunes:
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

// Determinar el ambiente (test o prod)
const env = (process.env.WOMPI_ENV as 'test' | 'prod') || 'test';
const isTest = env === 'test';

// Validar variables de entorno
const validateWompiConfig = (): void => {
  const publicKey = isTest 
    ? process.env.WOMPI_PUBLIC_KEY_TEST
    : process.env.WOMPI_PUBLIC_KEY;
    
  const integrityKey = isTest
    ? (process.env.WOMPI_INTEGRITY_KEY_TEST || process.env.WOMPI_INTEGRITY_SECRET_TEST)
    : (process.env.WOMPI_INTEGRITY_KEY || process.env.WOMPI_INTEGRITY_SECRET);
  
  if (!publicKey || !integrityKey) {
    const missing = [];
    if (!publicKey) missing.push(isTest ? 'WOMPI_PUBLIC_KEY_TEST' : 'WOMPI_PUBLIC_KEY');
    if (!integrityKey) missing.push(isTest ? 'WOMPI_INTEGRITY_KEY_TEST o WOMPI_INTEGRITY_SECRET_TEST' : 'WOMPI_INTEGRITY_KEY o WOMPI_INTEGRITY_SECRET');
    
    console.warn(`⚠️ Advertencia: Faltan variables de entorno de Wompi (${env}): ${missing.join(', ')}`);
    console.warn('⚠️ La integración de Wompi no funcionará correctamente sin estas variables.');
  }
};

// Configuración de Wompi
// En test, SOLO busca variables con sufijo _test (sin fallback a producción)
// En prod, SOLO busca variables sin sufijo (sin fallback a test)
const publicKey = isTest
  ? (process.env.WOMPI_PUBLIC_KEY_TEST || '').trim()
  : (process.env.WOMPI_PUBLIC_KEY || '').trim();

// MUY IMPORTANTE: hacer trim() para eliminar espacios/saltos de línea que puedan venir del .env
const integritySecretRaw = isTest
  ? (process.env.WOMPI_INTEGRITY_KEY_TEST || process.env.WOMPI_INTEGRITY_SECRET_TEST || '')
  : (process.env.WOMPI_INTEGRITY_KEY || process.env.WOMPI_INTEGRITY_SECRET || '');

// Logs de debug para verificar el secreto
console.log('🔐 integritySecretRaw:', integritySecretRaw);
console.log('🔐 integritySecretRaw length:', integritySecretRaw?.length);

const integritySecret = integritySecretRaw.trim();

console.log('🔐 integritySecret (trim):', integritySecret);
console.log('🔐 integritySecret length (trim):', integritySecret?.length);

// Validar longitud esperada (test_integrity_... tiene 47 caracteres)
if (isTest && integritySecret.length !== 47) {
  console.warn(`⚠️ ADVERTENCIA: El secreto de integridad TEST tiene ${integritySecret.length} caracteres, se esperan 47.`);
  console.warn('⚠️ Verifica que no haya espacios o caracteres extra en WOMPI_INTEGRITY_KEY_TEST');
}

// EVENT_SECRET: busca primero la específica del ambiente (WOMPI_EVENTS_KEY_TEST o WOMPI_EVENTS_KEY)
// Si no existe, usa INTEGRITY_SECRET como fallback
const eventSecret = isTest
  ? (process.env.WOMPI_EVENTS_KEY_TEST || integritySecret)
  : (process.env.WOMPI_EVENTS_KEY || integritySecret);

export const wompiConfig: WompiConfig = {
  PUBLIC_KEY: publicKey,
  INTEGRITY_SECRET: integritySecret,
  EVENT_SECRET: eventSecret,
  ENV: env,
  API_URL: env === 'prod' 
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1',
  CURRENCY: 'COP',
  COUNTRY: 'CO',
  REDIRECT_URL: process.env.WOMPI_REDIRECT_URL || undefined,
  isSandbox: env !== 'prod'
};

// Validar al cargar el módulo
validateWompiConfig();

// Log de configuración (sin mostrar secretos completos)
if (wompiConfig.PUBLIC_KEY && wompiConfig.INTEGRITY_SECRET) {
  const envSuffix = isTest ? '_TEST' : '';
  
  // Determinar qué variables se están usando realmente
  const integrityVarUsed = isTest
    ? (process.env.WOMPI_INTEGRITY_KEY_TEST ? 'WOMPI_INTEGRITY_KEY_TEST' : 'WOMPI_INTEGRITY_SECRET_TEST')
    : (process.env.WOMPI_INTEGRITY_KEY ? 'WOMPI_INTEGRITY_KEY' : 'WOMPI_INTEGRITY_SECRET');
  
  const eventVarUsed = isTest
    ? (process.env.WOMPI_EVENTS_KEY_TEST ? 'WOMPI_EVENTS_KEY_TEST' : `${integrityVarUsed} (fallback)`)
    : (process.env.WOMPI_EVENTS_KEY ? 'WOMPI_EVENTS_KEY' : `${integrityVarUsed} (fallback)`);
  
  console.log(`✅ Configuración de Wompi cargada (usando variables${envSuffix}):`, {
    ENV: wompiConfig.ENV,
    API_URL: wompiConfig.API_URL,
    CURRENCY: wompiConfig.CURRENCY,
    PUBLIC_KEY: wompiConfig.PUBLIC_KEY.substring(0, 20) + '...',
    INTEGRITY_SECRET: wompiConfig.INTEGRITY_SECRET.substring(0, 15) + '...' + ` [${integrityVarUsed}]`,
    EVENT_SECRET: wompiConfig.EVENT_SECRET ? wompiConfig.EVENT_SECRET.substring(0, 15) + '...' + ` [${eventVarUsed}]` : 'No configurado',
    REDIRECT_URL: wompiConfig.REDIRECT_URL || 'No configurada',
    VARIABLES_USADAS: isTest 
      ? 'WOMPI_PUBLIC_KEY_TEST, WOMPI_INTEGRITY_KEY_TEST/WOMPI_INTEGRITY_SECRET_TEST, WOMPI_EVENTS_KEY_TEST'
      : 'WOMPI_PUBLIC_KEY, WOMPI_INTEGRITY_KEY/WOMPI_INTEGRITY_SECRET, WOMPI_EVENTS_KEY'
  });
}

