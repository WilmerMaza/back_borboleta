import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import connectDB from '../infrastructure/database/config/database';

async function verifyPermissions() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Contar total de permisos
    const totalPermissions = await PermissionModel.countDocuments();
    console.log(`📊 Total de permisos en la base de datos: ${totalPermissions}`);

    // Contar permisos del rol admin
    const adminRole = await RoleModel.findOne({ name: 'admin' });
    if (adminRole) {
      const adminPermissions = await RolePermissionModel.countDocuments({ role_id: (adminRole as any).id });
      console.log(`🛡️ Permisos asignados al rol admin: ${adminPermissions}`);
    }

    // Mostrar algunos permisos de ejemplo
    console.log('\n📋 Primeros 20 permisos:');
    const samplePermissions = await PermissionModel.find().limit(20);
    samplePermissions.forEach((perm: any, index) => {
      console.log(`   ${index + 1}. ${perm.name} (${perm.guard_name})`);
    });

    // Mostrar permisos por módulo
    console.log('\n📂 Permisos por módulo:');
    const modules = ['users', 'roles', 'products', 'categories', 'brands', 'orders', 'stores', 'shipping', 'taxes', 'coupons'];
    
    for (const module of modules) {
      const modulePermissions = await PermissionModel.countDocuments({ 
        name: { $regex: `^${module}\.` } 
      });
      console.log(`   ${module}: ${modulePermissions} permisos`);
    }

    // Verificar permisos específicos que mencionaste
    const specificPermissions = [
      'users.create', 'users.read', 'users.update', 'users.delete', 'users.manage',
      'roles.create', 'roles.read', 'roles.update', 'roles.delete', 'permissions.manage',
      'products.create', 'products.read', 'products.update', 'products.delete', 'products.manage'
    ];

    console.log('\n🔍 Verificando permisos específicos:');
    for (const permName of specificPermissions) {
      const exists = await PermissionModel.findOne({ name: permName });
      console.log(`   ${exists ? '✅' : '❌'} ${permName}`);
    }

  } catch (error) {
    console.error('❌ Error al verificar permisos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

verifyPermissions().catch(error => {
  console.error('Error en el script de verificación:', error);
  process.exit(1);
});

