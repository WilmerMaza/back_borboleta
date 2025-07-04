import 'reflect-metadata';  // Esta importación debe ser la primera
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './infrastructure/di/registry';  // Importar el registro de dependencias
import './infrastructure/database/models';  // Importar todos los modelos
import productRoutes from './presentation/routes/product.routes';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './presentation/routes/category.routes';
import orderRoutes from './presentation/routes/order.routes';
import connectDB from './infrastructure/database/config/database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

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
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

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
