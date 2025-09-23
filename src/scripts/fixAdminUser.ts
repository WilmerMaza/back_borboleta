import mongoose from 'mongoose';
import UserModel from '../infrastructure/database/models/UserModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import connectDB from '../infrastructure/database/config/database';

async function fixAdminUser() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Buscar el usuario admin@borboleta.com
    const adminUser = await UserModel.findOne({ email: 'admin@borboleta.com' });
    
    if (!adminUser) {
      console.log('❌ Usuario admin@borboleta.com no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Nombre: ${adminUser.name}`);
    console.log(`   Rol actual: ${adminUser.role_id}`);

    // Buscar el rol admin (ID 1)
    const adminRole = await RoleModel.findOne({ name: 'admin' });
    
    if (!adminRole) {
      console.log('❌ Rol admin no encontrado');
      return;
    }

    console.log(`✅ Rol encontrado: ${(adminRole as any).name} (ID: ${(adminRole as any).id})`);

    // Actualizar el rol del usuario
    adminUser.role_id = (adminRole as any).id;
    await adminUser.save();

    console.log('🎉 Usuario admin@borboleta.com actualizado exitosamente!');
    console.log('📋 Detalles del usuario:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Nombre: ${adminUser.name}`);
    console.log(`   Rol: ${(adminRole as any).name} (ID: ${(adminRole as any).id})`);

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

fixAdminUser().catch(error => {
  console.error('Error en el script de corrección del usuario admin:', error);
  process.exit(1);
});
