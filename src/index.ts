import 'reflect-metadata';  // Esta importación debe ser la primera
import dotenv from 'dotenv';

dotenv.config(); // esto carga el .env de la raíz (DEBE ser antes de cualquier importación que use process.env)

import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

// Middleware para bypass del banner de ngrok (si es necesario)
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  // Permitir peticiones de ngrok sin el banner
  if (req.headers['ngrok-skip-browser-warning']) {
    // Ya tiene el header, continuar
  }
  next();
});


app.post(
  '/api/wompi/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const { container } = await import('./infrastructure/di/registry');
      const { WompiController } = await import('./presentation/controllers/WompiController');
      const wompiController = container.resolve('WompiController') as InstanceType<typeof WompiController>;
      return wompiController.handleWebhook(req, res);
    } catch (error: any) {
      console.error('Error en webhook handler:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando webhook',
        error: error.message
      });
    }
  }
);

// --------- 2️⃣ JSON DESPUÉS DEL WEBHOOK ---------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------- 3️⃣ AHORA IMPORTAS TODO LO DEMÁS (SEGURO) ---------
import './infrastructure/di/registry';
import './infrastructure/database/models';

// 💚 3️⃣ AHORA sí cargar todas las demás rutas
import productRoutes from './presentation/routes/product.routes';
import categoryRoutes from './presentation/routes/category.routes';
import orderRoutes from './presentation/routes/order.routes';
import cartRoutes from './presentation/routes/cart.routes';
import checkoutRoutes from './presentation/routes/checkout.routes';
import settingsRoutes from './presentation/routes/settings.routes';
import settingThemeRoutes from './presentation/routes/setting-theme.routes';
import addressRoutes from './presentation/routes/address.routes';
import authRoutes from './presentation/routes/auth.routes';
import unifiedAuthRoutes from './presentation/routes/unified-auth.routes';
import roleRoutes from './presentation/routes/role.routes';
import permissionRoutes from './presentation/routes/permission.routes';
import userPermissionRoutes from './presentation/routes/user-permission.routes';
import adminRoutes from './presentation/routes/admin.routes';
import orderStatusRoutes from './presentation/routes/order-status.routes';
import uploadRoutes from './presentation/routes/upload.routes';
import attachmentRoutes from './presentation/routes/attachment.routes';
import attributeRoutes from './presentation/routes/attribute.routes';
import attributeValueRoutes from './presentation/routes/attribute-value.routes';
import wompiRoutes from './presentation/routes/wompi.routes';
import userRoutes from './routes/userRoutes';
import connectDB from './infrastructure/database/config/database';

// Conectar a MongoDB
connectDB()
  .then(() => {
    console.log('✅ Base de datos conectada');
  })
  .catch((error) => {
    console.error('❌ Error al conectar la base de datos:', error);
    process.exit(1);
  });

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', unifiedAuthRoutes); // Rutas unificadas para login
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', orderStatusRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users/addresses', addressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-permissions', userPermissionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/setting-theme', settingThemeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/attribute-values', attributeValueRoutes);
app.use('/api/wompi', wompiRoutes);

// Ruta de prueba
app.get('/', (_req, res) => {
  res.json({ message: 'API de Borboleta funcionando correctamente' });
});

// Manejo de errores
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
