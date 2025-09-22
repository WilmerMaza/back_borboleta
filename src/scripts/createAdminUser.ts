import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../infrastructure/database/models/UserModel';
import connectDB from '../infrastructure/database/config/database';

async function createAdminUser() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email: 'admin@borboleta.com' });
    if (existingUser) {
      console.log('⚠️  El usuario admin@borboleta.com ya existe');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Nombre: ${existingUser.name}`);
      console.log(`   Rol: ${existingUser.role_id}`);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    // Crear usuario admin@borboleta.com
    const userData = {
      name: 'Super Administrador',
      email: 'admin@borboleta.com',
      password: hashedPassword,
      phone: '1234567890',
      country_code: 1,
      role_id: 1, // Rol admin
      status: true,
      is_approved: true
    };

    const newUser = new UserModel(userData);
    await (newUser as any).save();

    console.log('🎉 Usuario admin@borboleta.com creado exitosamente!');
    console.log('📋 Detalles del usuario:');
    console.log(`   ID: ${(newUser as any).id}`);
    console.log(`   Nombre: ${(newUser as any).name}`);
    console.log(`   Email: ${(newUser as any).email}`);
    console.log(`   Password: admin123456`);
    console.log(`   Rol: 1 (admin)`);

    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Email: admin@borboleta.com');
    console.log('   Password: admin123456');
    console.log('\n📡 Endpoint de login:');
    console.log('   POST http://localhost:3001/api/users/login');

  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

createAdminUser().catch(error => {
  console.error('Error en el script de creación del usuario admin:', error);
  process.exit(1);
});

