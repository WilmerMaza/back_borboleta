import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../infrastructure/database/models/UserModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function updateUserPassword() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar el usuario
    const user = await UserModel.findOne({ email: 'borboleta.com@gmail.com' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Password actual (hash): ${user.password}`);

    // Generar nuevo hash para la contraseña
    const newHashedPassword = await bcrypt.hash('123456', 12);
    console.log(`   Nuevo hash: ${newHashedPassword}`);

    // Actualizar la contraseña
    user.password = newHashedPassword;
    await (user as any).save();

    console.log('✅ Contraseña actualizada exitosamente');

    // Verificar que la contraseña funciona
    const isPasswordValid = await bcrypt.compare('123456', newHashedPassword);
    console.log(`✅ Verificación de contraseña: ${isPasswordValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
updateUserPassword();

