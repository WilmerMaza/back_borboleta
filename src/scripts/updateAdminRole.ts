import mongoose from 'mongoose';
import UserModel from '../infrastructure/database/models/UserModel';
import connectDB from '../infrastructure/database/config/database';

async function updateAdminRole() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Buscar el usuario admin@borboleta.com por ID 7
    const adminUser = await UserModel.findOne({ id: 7 });
    
    if (!adminUser) {
      console.log('❌ Usuario con ID 7 no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Nombre: ${adminUser.name}`);
    console.log(`   Rol actual: ${adminUser.role_id}`);

    // Actualizar el rol a 1 (admin)
    adminUser.role_id = 1;
    await adminUser.save();

    console.log('🎉 Usuario admin@borboleta.com actualizado exitosamente!');
    console.log('📋 Detalles del usuario:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Nombre: ${adminUser.name}`);
    console.log(`   Rol: 1 (admin)`);

    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Email: admin@borboleta.com');
    console.log('   Password: admin123456');

  } catch (error) {
    console.error('❌ Error al actualizar usuario admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

updateAdminRole().catch(error => {
  console.error('Error en el script de actualización del rol admin:', error);
  process.exit(1);
});

