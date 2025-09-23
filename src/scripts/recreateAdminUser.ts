import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../infrastructure/database/models/UserModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import connectDB from '../infrastructure/database/config/database';

async function recreateAdminUser() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    const adminEmail = 'admin@borboleta.com';
    const adminPassword = 'admin123456';

    // 1. Eliminar usuario admin existente
    console.log('🗑️ Eliminando usuario admin existente...');
    const deletedUser = await UserModel.findOneAndDelete({ email: adminEmail });
    if (deletedUser) {
      console.log(`   ✅ Usuario eliminado: ${(deletedUser as any).email} (ID: ${(deletedUser as any).id})`);
    } else {
      console.log('   ℹ️ Usuario admin no encontrado, continuando...');
    }

    // 2. Verificar que el rol admin existe
    console.log('🛡️ Verificando rol admin...');
    let adminRole = await RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('   ❌ Rol admin no encontrado. Creando uno nuevo...');
      adminRole = new RoleModel({
        name: 'admin',
        guard_name: 'web',
        system_reserve: 1,
        description: 'Rol de administrador del sistema'
      });
      await (adminRole as any).save();
      console.log(`   ✅ Rol admin creado con ID: ${(adminRole as any).id}`);
    } else {
      console.log(`   ✅ Rol admin encontrado con ID: ${(adminRole as any).id}`);
    }

    // 3. Verificar que los permisos existen
    console.log('🔑 Verificando permisos...');
    const totalPermissions = await PermissionModel.countDocuments();
    console.log(`   📊 Total de permisos en BD: ${totalPermissions}`);

    if (totalPermissions === 0) {
      console.log('   ❌ No hay permisos en la base de datos. Ejecute primero: npm run load-real-permissions');
      return;
    }

    // 4. Verificar permisos asignados al rol admin
    const rolePermissions = await RolePermissionModel.find({ role_id: (adminRole as any).id });
    console.log(`   📋 Permisos asignados al rol admin: ${rolePermissions.length}`);

    if (rolePermissions.length === 0) {
      console.log('   ⚠️ El rol admin no tiene permisos asignados. Asignando todos los permisos...');
      
      // Obtener todos los permisos
      const allPermissions = await PermissionModel.find({});
      
      // Asignar todos los permisos al rol admin
      const newRolePermissions = allPermissions.map((permission: any) => ({
        role_id: (adminRole as any).id,
        permission_id: permission.id
      }));

      await RolePermissionModel.insertMany(newRolePermissions);
      console.log(`   ✅ ${newRolePermissions.length} permisos asignados al rol admin`);
    }

    // 5. Crear nuevo usuario admin
    console.log('👤 Creando nuevo usuario admin...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const newAdminUser = new UserModel({
      name: 'Super Administrador',
      email: adminEmail,
      password: hashedPassword,
      phone: '1234567890',
      country_code: 1,
      role_id: (adminRole as any).id,
      status: true,
      is_approved: true
    });

    await (newAdminUser as any).save();
    console.log(`   ✅ Usuario admin creado con ID: ${(newAdminUser as any).id}`);

    // 6. Verificar la creación
    console.log('🔍 Verificando usuario creado...');
    const createdUser = await UserModel.findOne({ email: adminEmail });
    if (createdUser) {
      console.log('   ✅ Usuario encontrado:');
      console.log(`      ID: ${createdUser.id}`);
      console.log(`      Email: ${createdUser.email}`);
      console.log(`      Nombre: ${createdUser.name}`);
      console.log(`      Rol ID: ${createdUser.role_id}`);
      console.log(`      Status: ${createdUser.status}`);
      console.log(`      Aprobado: ${createdUser.is_approved}`);
    }

    // 7. Verificar permisos del usuario
    console.log('🔑 Verificando permisos del usuario...');
    const userRolePermissions = await RolePermissionModel.find({ role_id: (adminRole as any).id });
    console.log(`   📊 Permisos asignados: ${userRolePermissions.length}`);

    // 8. Probar login
    console.log('🔐 Probando login...');
    const testUser = await UserModel.findOne({ email: adminEmail });
    if (testUser) {
      const isPasswordValid = await bcrypt.compare(adminPassword, testUser.password);
      console.log(`   ${isPasswordValid ? '✅' : '❌'} Contraseña válida: ${isPasswordValid}`);
    }

    console.log('\n🎉 ¡Usuario admin recreado exitosamente!');
    console.log('📋 Credenciales:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Permisos: ${userRolePermissions.length}`);

  } catch (error) {
    console.error('❌ Error al recrear usuario admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

recreateAdminUser().catch(error => {
  console.error('Error en el script de recreación de usuario admin:', error);
  process.exit(1);
});
