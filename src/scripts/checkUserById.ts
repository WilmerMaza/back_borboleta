import mongoose from 'mongoose';
import UserModel from '../infrastructure/database/models/UserModel';
import connectDB from '../infrastructure/database/config/database';

async function checkUserById() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Buscar usuario por ID 11
    const user11 = await UserModel.findOne({ id: 11 });
    if (user11) {
      console.log('👤 Usuario ID 11 encontrado:');
      console.log(`   ID: ${user11.id}`);
      console.log(`   Email: ${user11.email}`);
      console.log(`   Nombre: ${user11.name}`);
      console.log(`   Rol: ${user11.role_id}`);
    } else {
      console.log('❌ Usuario con ID 11 no encontrado');
    }

    // Buscar usuario por email admin@borboleta.com
    const adminUser = await UserModel.findOne({ email: 'admin@borboleta.com' });
    if (adminUser) {
      console.log('\n👤 Usuario admin@borboleta.com encontrado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nombre: ${adminUser.name}`);
      console.log(`   Rol: ${adminUser.role_id}`);
    } else {
      console.log('\n❌ Usuario admin@borboleta.com no encontrado');
    }

  } catch (error) {
    console.error('❌ Error al buscar usuarios:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

checkUserById().catch(error => {
  console.error('Error en el script de verificación de usuarios:', error);
  process.exit(1);
});

