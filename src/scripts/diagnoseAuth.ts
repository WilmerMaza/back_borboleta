import mongoose from 'mongoose';
import UserModel from '../infrastructure/database/models/UserModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import connectDB from '../infrastructure/database/config/database';

async function diagnoseAuth() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // 1. Verificar usuario admin
    const adminUser = await UserModel.findOne({ email: 'admin@borboleta.com' });
    if (!adminUser) {
      console.log('❌ Usuario admin@borboleta.com no encontrado');
      return;
    }

    console.log('👤 Usuario admin encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Nombre: ${adminUser.name}`);
    console.log(`   Rol ID: ${adminUser.role_id}`);
    console.log(`   Status: ${adminUser.status}`);
    console.log(`   Aprobado: ${adminUser.is_approved}`);

    // 2. Verificar rol
    const role = await RoleModel.findOne({ id: adminUser.role_id });
    if (!role) {
      console.log('❌ Rol no encontrado');
      return;
    }

    console.log('\n🛡️ Rol encontrado:');
    console.log(`   ID: ${(role as any).id}`);
    console.log(`   Nombre: ${(role as any).name}`);
    console.log(`   Guard: ${(role as any).guard_name}`);
    console.log(`   Sistema: ${(role as any).system_reserve}`);

    // 3. Verificar permisos
    const rolePermissions = await RolePermissionModel.find({ role_id: adminUser.role_id });
    console.log(`\n🔑 Permisos asignados: ${rolePermissions.length}`);

    // 4. Verificar algunos permisos específicos
    const permissions = await PermissionModel.find({ 
      id: { $in: rolePermissions.map((rp: any) => rp.permission_id) }
    }).limit(10);

    console.log('\n📋 Primeros 10 permisos:');
    permissions.forEach((perm: any) => {
      console.log(`   ${perm.id}: ${perm.name} (${perm.guard_name})`);
    });

    // 5. Generar token de prueba
    const jwt = require('jsonwebtoken');
    const authConfig = require('../config/auth');
    
    const testToken = jwt.sign(
      { 
        userId: adminUser.id, 
        email: adminUser.email,
        iat: Math.floor(Date.now() / 1000)
      },
      authConfig.authConfig.JWT_SECRET,
      { expiresIn: authConfig.authConfig.JWT_EXPIRES_IN }
    );

    console.log('\n🔐 Token de prueba generado:');
    console.log(`   ${testToken}`);

    // 6. Verificar token
    try {
      const decoded = jwt.verify(testToken, authConfig.authConfig.JWT_SECRET);
      console.log('\n✅ Token verificado correctamente:');
      console.log(`   ${JSON.stringify(decoded, null, 2)}`);
    } catch (error) {
      console.log('\n❌ Error al verificar token:');
      console.log(`   ${error}`);
    }

    console.log('\n🌐 Endpoints de prueba:');
    console.log('   Login: POST http://localhost:3001/api/users/login');
    console.log('   Me: GET http://localhost:3001/api/auth/me');
    console.log('\n📝 Headers requeridos:');
    console.log('   Authorization: Bearer TOKEN');
    console.log('   Content-Type: application/json');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

diagnoseAuth().catch(error => {
  console.error('Error en el script de diagnóstico:', error);
  process.exit(1);
});
