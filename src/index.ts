import 'reflect-metadata';  // Esta importación debe ser la primera
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import './infrastructure/di/registry';  // Importar el registro de dependencias
import './infrastructure/database/models';  // Importar todos los modelos
import productRoutes from './presentation/routes/product.routes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('✅ Conexión a MongoDB establecida'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
