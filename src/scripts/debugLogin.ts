import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../infrastructure/database/models/UserModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function debugLogin() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const email = 'borboleta.com@gmail.com';
    const password = '123456';

    console.log(`🔍 Buscando usuario con email: ${email}`);

    // Buscar usuario directamente con Mongoose
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado con Mongoose');
      
      // Verificar todos los usuarios
      const allUsers = await UserModel.find();
      console.log('📋 Todos los usuarios en la base de datos:');
      allUsers.forEach((u: any) => {
        console.log(`   - ID: ${u.id}, Email: "${u.email}", Nombre: ${u.name}`);
      });
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: "${user.email}"`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Password hash: ${user.password}`);

    // Verificar contraseña
    console.log(`🔐 Verificando contraseña: ${password}`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`✅ Contraseña válida: ${isPasswordValid}`);

    if (isPasswordValid) {
      console.log('🎉 Login debería funcionar correctamente');
    } else {
      console.log('❌ La contraseña no coincide');
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
debugLogin();

