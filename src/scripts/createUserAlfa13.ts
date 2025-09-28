import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../infrastructure/database/models/UserModel';
import RoleModel from '../infrastructure/database/models/RoleModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function createUserAlfa13() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email: 'alfa13@gmail.com' });
    if (existingUser) {
      console.log('⚠️  El usuario alfa13@gmail.com ya existe');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Nombre: ${existingUser.name}`);
      return;
    }

    // Buscar el rol de administrador (usar el rol con ID 1 o 2)
    let adminRole = await RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await RoleModel.findOne({ name: 'Super Administrador' });
    }
    
    if (!adminRole) {
      console.log('❌ No se encontró ningún rol de administrador');
      return;
    }

    console.log(`✅ Rol encontrado: ${adminRole.name} (ID: ${adminRole.id})`);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('tgtght', 12);

    // Crear usuario alfa13
    const userData = {
      name: 'Sofia Alfa13',
      email: 'alfa13@gmail.com',
      password: hashedPassword,
      phone: '1234567890',
      country_code: 1,
      role_id: adminRole.id,
      status: true,
      is_approved: true
    };

    const newUser = new UserModel(userData);
    await (newUser as any).save();

    console.log('🎉 Usuario alfa13@gmail.com creado exitosamente!');
    console.log('📋 Detalles del usuario:');
    console.log(`   ID: ${(newUser as any).id}`);
    console.log(`   Nombre: ${(newUser as any).name}`);
    console.log(`   Email: ${(newUser as any).email}`);
    console.log(`   Password: tgtght`);
    console.log(`   Rol: ${adminRole.name} (ID: ${adminRole.id})`);

    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Email: alfa13@gmail.com');
    console.log('   Password: tgtght');
    console.log('\n📡 Endpoint de login:');
    console.log('   POST http://localhost:3001/api/users/login');

  } catch (error) {
    console.error('❌ Error al crear usuario alfa13:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
createUserAlfa13();

