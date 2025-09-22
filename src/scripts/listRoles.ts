import mongoose from 'mongoose';
import RoleModel from '../infrastructure/database/models/RoleModel';
import connectDB from '../infrastructure/database/config/database';

async function listRoles() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    const roles = await RoleModel.find();

    console.log(`📋 Total de roles: ${roles.length}\n`);
    console.log('🛡️ Lista de roles:\n');

    roles.forEach((role, index) => {
      console.log(`${index + 1}. Rol:`);
      console.log(`   ID: ${(role as any).id}`);
      console.log(`   Nombre: ${(role as any).name}`);
      console.log(`   Guard: ${(role as any).guard_name}`);
      console.log(`   Sistema: ${(role as any).system_reserve ? 'Sí' : 'No'}`);
      console.log(`   Descripción: ${(role as any).description || 'Sin descripción'}\n`);
    });

  } catch (error) {
    console.error('❌ Error al listar roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

listRoles().catch(error => {
  console.error('Error en el script de listar roles:', error);
  process.exit(1);
});
