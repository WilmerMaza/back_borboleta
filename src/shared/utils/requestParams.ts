/**
 * Utilidades para normalizar parámetros de Express Request
 * 
 * En @types/express v5.x, req.params puede ser string | string[]
 * Esta función normaliza siempre a string para mantener compatibilidad
 * 
 * En runtime, Express normalmente devuelve strings para parámetros de ruta,
 * pero TypeScript es más estricto en las versiones nuevas.
 */

/**
 * Normaliza un parámetro de ruta a string
 * Si es un array, toma el primer elemento
 * Si es undefined, devuelve string vacío
 */
export function normalizeParam(param: string | string[] | undefined): string {
  if (param === undefined) {
    return '';
  }
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Normaliza un parámetro de ruta a string y luego lo convierte a número
 * Útil para IDs numéricos
 */
export function normalizeParamToNumber(param: string | string[] | undefined): number {
  const normalized = normalizeParam(param);
  return parseInt(normalized, 10);
}

/**
 * Parsea el query param 'include' (ej: "variations,attributes") en un array de strings
 * Usado para solicitar relaciones en endpoints como GET /products/:id
 */
export function parseIncludeParam(param: unknown): string[] {
  if (param === undefined || param === null) return [];
  const str = Array.isArray(param) ? param[0] : param;
  if (!str || typeof str !== 'string') return [];
  return str.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
}
