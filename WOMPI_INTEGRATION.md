# Documentación de Integración con Wompi

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Arquitectura](#arquitectura)
4. [Flujo de Pago](#flujo-de-pago)
5. [Endpoints](#endpoints)
6. [Modelos de Datos](#modelos-de-datos)
7. [Webhooks](#webhooks)
8. [Seguridad](#seguridad)
9. [Troubleshooting](#troubleshooting)

---

## Introducción

Esta integración permite procesar pagos en línea mediante Wompi, un gateway de pagos colombiano. El sistema utiliza un flujo asíncrono donde las órdenes se crean temporalmente como `PendingOrder` y se convierten en órdenes finales (`Order`) solo cuando Wompi confirma el pago mediante webhook.

### Características Principales

- ✅ Creación de órdenes temporales (`PendingOrder`) con TTL automático
- ✅ Procesamiento asíncrono mediante webhooks
- ✅ Verificación de firmas para seguridad
- ✅ Soporte para múltiples métodos de pago (tarjeta, PSE, etc.)
- ✅ Manejo de estados de pago (APPROVED, DECLINED, PENDING, VOIDED)

---

## Configuración

### Variables de Entorno

Agregar las siguientes variables al archivo `.env`:

```env
# Wompi Configuration
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_INTEGRITY_KEY=test_integrity_xxxxx
WOMPI_EVENT_SECRET=test_integrity_xxxxx  # Opcional, usa INTEGRITY_KEY si no está definido
WOMPI_ENV=test  # 'test' o 'prod'
WOMPI_REDIRECT_URL=http://localhost:4200/account/order  # Opcional
```

### Configuración de Wompi

1. **Obtener credenciales:**
   - Acceder al panel de Wompi (sandbox o producción)
   - Obtener `PUBLIC_KEY` y `INTEGRITY_KEY`

2. **Configurar Webhook:**
   - URL del webhook: `https://tu-dominio.com/api/wompi/webhook`
   - Eventos: `transaction.updated`
   - En desarrollo, usar ngrok: `ngrok http 3001`

---

## Arquitectura

### Estructura de Archivos

```
src/
├── application/
│   └── services/
│       └── WompiService.ts          # Lógica de negocio de Wompi
├── config/
│   └── wompi.ts                     # Configuración centralizada
├── domain/
│   └── entities/
│       └── Order.ts                 # Interfaces de dominio
├── infrastructure/
│   ├── database/
│   │   └── models/
│   │       ├── OrderModel.ts        # Modelo de órdenes
│   │       └── PendingOrderModel.ts # Modelo de órdenes pendientes
│   └── repositories/
│       ├── OrderRepository.ts       # Repositorio de órdenes
│       └── PendingOrderRepository.ts # Repositorio de órdenes pendientes
└── presentation/
    ├── controllers/
    │   └── WompiController.ts      # Controlador de endpoints
    └── routes/
        └── wompi.routes.ts          # Rutas de la API
```

### Componentes Principales

#### 1. WompiService

Servicio que maneja:

- Generación de referencias únicas
- Cálculo de firmas de integridad
- Verificación de firmas de webhooks
- Consulta de estado de transacciones

#### 2. WompiController

Controlador que expone:

- `POST /api/wompi/widget-data`: Genera datos para el widget de pago
- `POST /api/wompi/webhook`: Procesa notificaciones de Wompi
- `GET /api/wompi/verify/:reference`: Verifica estado de transacción

#### 3. PendingOrderModel

Modelo temporal con TTL (Time To Live):

- Se elimina automáticamente después de expirar
- Almacena datos de la orden antes del pago
- Campo `expires_at` controla la expiración

---

## Flujo de Pago

### 1. Inicio del Proceso

```
Usuario → Frontend → POST /api/wompi/widget-data
```

**Request:**

```json
{
  "products": [...],
  "shipping_address": {...},
  "billing_address": {...},
  "shipping_cost": 0,
  "tax_amount": 2839.45,
  "subtotal": 56789,
  "total": 59628.45
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "publicKey": "pub_test_xxxxx",
    "currency": "COP",
    "amountInCents": 5962845,
    "reference": "ABC123XYZ456",
    "signatureIntegrity": "sha256_hash",
    "redirectUrl": "http://localhost:4200/account/order?reference=ABC123XYZ456",
    "expirationTime": "2025-11-26T04:30:18.262Z",
    "customerData": {...},
    "shippingAddress": {...}
  }
}
```

### 2. Creación de PendingOrder

El backend crea una `PendingOrder` con:

- Referencia única generada
- Datos del usuario y productos
- Fecha de expiración (1 hora por defecto)
- TTL index para eliminación automática

### 3. Procesamiento en Wompi

El frontend usa los datos del widget para:

1. Inicializar el widget de Wompi
2. Procesar el pago del usuario
3. Redirigir según el resultado

### 4. Webhook de Confirmación

```
Wompi → POST /api/wompi/webhook
```

**Payload del Webhook:**

```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "1116417-1764127845-26074",
      "status": "APPROVED",
      "reference": "ABC123XYZ456",
      "amount_in_cents": 5962845,
      ...
    }
  },
  "signature": {
    "checksum": "sha256_hmac",
    "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"]
  }
}
```

### 5. Creación de Orden Final

Si el status es `APPROVED`:

1. Buscar `PendingOrder` por referencia
2. Obtener direcciones completas del usuario
3. Crear `Order` con estado `paid` y `confirmed`
4. Eliminar `PendingOrder`
5. Responder 200 a Wompi

### 6. Verificación desde Frontend

```
Frontend → GET /api/wompi/verify/:reference
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "...",
    "orderNumber": "17",
    "paymentStatus": "paid",
    "orderStatus": "confirmed",
    "wompiStatus": "APPROVED",
    "isPending": false
  }
}
```

---

## Endpoints

### POST /api/wompi/widget-data

Genera los datos necesarios para inicializar el widget de Wompi.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

- `products`: Array de productos
- `shipping_address`: Dirección de envío
- `billing_address`: Dirección de facturación
- `shipping_cost`: Costo de envío
- `tax_amount`: Impuestos
- `subtotal`: Subtotal
- `total`: Total

**Response:**

- `publicKey`: Clave pública de Wompi
- `reference`: Referencia única de la transacción
- `signatureIntegrity`: Firma SHA256 para validación
- `amountInCents`: Monto en centavos
- `customerData`: Datos del cliente
- `shippingAddress`: Dirección de envío formateada

### POST /api/wompi/webhook

Endpoint que recibe notificaciones de Wompi. **IMPORTANTE:** Este endpoint debe recibir el body como RAW Buffer para verificar la firma.

**Configuración en index.ts:**

```typescript
app.post(
  '/api/wompi/webhook',
  express.raw({ type: 'application/json' }), // Body RAW
  async (req, res) => { ... }
);
```

**Procesamiento:**

1. Verificar firma del webhook
2. Extraer `reference` y `status`
3. Buscar `PendingOrder` o `Order` existente
4. Si `APPROVED`: crear/actualizar orden
5. Si `DECLINED/VOIDED`: eliminar `PendingOrder`
6. Responder 200 siempre (para evitar reintentos)

### GET /api/wompi/verify/:reference

Verifica el estado de una transacción después del redirect.

**Parámetros:**

- `reference`: Referencia de la transacción

**Query Params:**

- `status`: Status opcional del redirect

**Response:**

- Si orden existe: datos completos de la orden
- Si solo existe `PendingOrder`: estado pendiente
- Si no existe: 404

---

## Modelos de Datos

### PendingOrder

```typescript
{
  reference: string;           // Referencia única de Wompi
  user_id: string;             // ID del usuario
  store_id: number;            // ID de la tienda
  items: OrderItem[];          // Productos
  total_amount: number;       // Total
  shipping_address: any;       // ID o objeto de dirección
  billing_address: any;        // ID o objeto de dirección
  expires_at: Date;           // Fecha de expiración (TTL)
  // ... otros campos
}
```

**TTL Index:**

```typescript
pendingOrderSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
```

### Order

```typescript
{
  user_id: string;
  store_id: number;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: 'wompi';
  payment_reference?: string;  // Referencia de Wompi
  shipping_address: IAddress;
  billing_address: IAddress;
  notes?: string;              // Metadatos de Wompi
  // ... otros campos
}
```

### IAddress

```typescript
{
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}
```

---

## Webhooks

### Configuración del Webhook en Wompi

1. Acceder al panel de Wompi
2. Ir a "Configuración" → "Webhooks"
3. Agregar nueva URL: `https://tu-dominio.com/api/wompi/webhook`
4. Seleccionar evento: `transaction.updated`
5. Guardar

### Desarrollo Local con Ngrok

```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar túnel
ngrok http 3001 --request-header-add "ngrok-skip-browser-warning: true"

# Copiar la URL HTTPS (ej: https://xxxxx.ngrok-free.dev)
# Configurar en Wompi: https://xxxxx.ngrok-free.dev/api/wompi/webhook
```

### Verificación de Firma

El webhook verifica la firma usando HMAC-SHA256:

```typescript
const chain = signature.properties
  .map(prop => transaction[prop])
  .join('');

const computed = crypto
  .createHmac('sha256', EVENT_SECRET)
  .update(chain)
  .digest('hex');

return computed === signature.checksum;
```

**Propiedades típicas:**

- `transaction.id`
- `transaction.status`
- `transaction.amount_in_cents`

### Estados del Webhook

| Estado | Acción |
|--------|--------|
| `APPROVED` | Crear orden final, eliminar `PendingOrder` |
| `DECLINED` | Eliminar `PendingOrder` |
| `VOIDED` | Eliminar `PendingOrder` |
| `PENDING` | No hacer nada, esperar |

### Camino B: Actualización de Órdenes Existentes

Si no se encuentra `PendingOrder`, el webhook busca una `Order` existente con `payment_status: 'pending'` y la actualiza a `paid`.

---

## Seguridad

### Firma de Integridad

La firma se genera con SHA256:

```typescript
// Sin expirationTime
SHA256(reference + amountInCents + currency + INTEGRITY_SECRET)

// Con expirationTime
SHA256(reference + amountInCents + currency + expirationTime + INTEGRITY_SECRET)
```

### Verificación de Webhook

- El webhook verifica la firma antes de procesar
- En producción, rechaza webhooks con firma inválida
- En desarrollo, permite continuar para debugging

### Variables Sensibles

- `WOMPI_INTEGRITY_KEY`: Nunca exponer en el frontend
- `WOMPI_EVENT_SECRET`: Solo usar en el backend
- `WOMPI_PUBLIC_KEY`: Segura para usar en el frontend

---

## Troubleshooting

### El webhook no llega

1. **Verificar URL en Wompi:**
   - Debe ser HTTPS en producción
   - En desarrollo, usar ngrok

2. **Verificar logs del servidor:**

   ```bash
   # Buscar logs del webhook
   grep "webhook" logs/server.log
   ```

3. **Probar endpoint de prueba:**

   ```bash
   curl https://tu-dominio.com/api/wompi/webhook/test
   ```

### La orden no se crea después del pago

1. **Verificar que el webhook llegó:**
   - Revisar logs del servidor
   - Verificar respuesta 200

2. **Verificar `PendingOrder`:**

   ```typescript
   // En desarrollo, usar endpoint de prueba
   GET /api/wompi/pending-orders
   ```

3. **Verificar direcciones:**
   - Asegurar que las direcciones existen en la BD
   - Verificar formato de `shipping_address` y `billing_address`

### Firma inválida

1. **Verificar `WOMPI_INTEGRITY_KEY`:**

   ```bash
   echo $WOMPI_INTEGRITY_KEY
   ```

2. **Verificar fórmula de firma:**
   - Revisar si se incluye `expirationTime`
   - Verificar orden de concatenación

3. **Verificar en logs:**
   - Buscar "Firma del webhook no coincide"

### Órdenes pendientes no se eliminan

1. **Verificar TTL index:**

   ```typescript
   // En MongoDB
   db.pendingorders.getIndexes()
   ```

2. **Verificar `expires_at`:**
   - Debe ser una fecha futura
   - MongoDB elimina automáticamente después de `expires_at`

### Error: "Direcciones no encontradas"

1. **Verificar que las direcciones existen:**

   ```typescript
   const addresses = await addressRepository.findByUserId(userId);
   ```

2. **Verificar formato de IDs:**
   - `shipping_address` y `billing_address` deben ser IDs numéricos
   - O objetos con propiedad `id`

---

## Ejemplos de Uso

### Frontend: Inicializar Widget

```typescript
// Obtener datos del widget
const response = await fetch('/api/wompi/widget-data', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    products: [...],
    shipping_address: {...},
    billing_address: {...},
    total: 59628.45
  })
});

const { data } = await response.json();

// Inicializar widget de Wompi
const wompiWidget = new WompiWidget({
  publicKey: data.publicKey,
  currency: data.currency,
  amountInCents: data.amountInCents,
  reference: data.reference,
  signature: data.signatureIntegrity,
  redirectUrl: data.redirectUrl,
  expirationTime: data.expirationTime
});

wompiWidget.open();
```

### Frontend: Verificar Estado

```typescript
// Después del redirect
const reference = new URLSearchParams(window.location.search).get('reference');

const response = await fetch(`/api/wompi/verify/${reference}`);
const { data } = await response.json();

if (data.isPending) {
  // Esperar webhook
  console.log('Pago pendiente, esperando confirmación...');
} else {
  // Orden creada
  console.log('Orden creada:', data.orderNumber);
}
```

---

## Referencias

- [Documentación oficial de Wompi](https://docs.wompi.co/)
- [API de Wompi](https://docs.wompi.co/en/api)
- [Webhooks de Wompi](https://docs.wompi.co/en/webhooks)

---

## Notas Adicionales

- Las `PendingOrder` se eliminan automáticamente después de expirar (TTL)
- El webhook siempre responde 200 para evitar reintentos de Wompi
- La firma de integridad es obligatoria para validar transacciones
- En producción, siempre verificar la firma del webhook antes de procesar
