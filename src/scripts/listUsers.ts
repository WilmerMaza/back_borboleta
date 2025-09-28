import mongoose from 'mongoose';
import UserModel from '../infrastructure/database/models/UserModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function listUsers() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Listar todos los usuarios
    const users = await UserModel.find();
    
    console.log(`📋 Total de usuarios: ${users.length}`);
    console.log('\n👥 Lista de usuarios:');
    
    users.forEach((user: any, index: number) => {
      console.log(`\n${index + 1}. Usuario:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: "${user.email}"`);
      console.log(`   Nombre: ${user.name}`);
      console.log(`   Rol ID: ${user.role_id}`);
      console.log(`   Estado: ${user.status ? 'Activo' : 'Inactivo'}`);
      console.log(`   Aprobado: ${user.is_approved ? 'Sí' : 'No'}`);
    });

  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
listUsers();

