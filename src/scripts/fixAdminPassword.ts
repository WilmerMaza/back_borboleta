import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../infrastructure/database/models/UserModel';
import connectDB from '../infrastructure/database/config/database';

async function fixAdminPassword() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    const adminEmail = 'admin@borboleta.com';
    const correctPassword = 'admin123456'; // Sin espacios

    // Buscar el usuario admin
    const adminUser = await UserModel.findOne({ email: adminEmail });
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    console.log('👤 Usuario admin encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Nombre: ${adminUser.name}`);

    // Generar nuevo hash de la contraseña correcta
    const hashedPassword = await bcrypt.hash(correctPassword, 12);
    
    // Actualizar la contraseña
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('✅ Contraseña actualizada correctamente');
    console.log('🔐 Credenciales de acceso:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${correctPassword}`);

    // Verificar que la contraseña funciona
    const isValid = await bcrypt.compare(correctPassword, adminUser.password);
    console.log(`🔍 Verificación de contraseña: ${isValid ? '✅ Válida' : '❌ Inválida'}`);

  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

fixAdminPassword().catch(error => {
  console.error('Error en el script de corrección de contraseña:', error);
  process.exit(1);
});

