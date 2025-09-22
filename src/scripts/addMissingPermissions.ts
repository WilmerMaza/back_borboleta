import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import connectDB from '../infrastructure/database/config/database';

async function addMissingPermissions() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Permisos faltantes para el menú
    const missingPermissions = [
      // Themes
      { name: 'theme.index', guard_name: 'web', resource: 'theme', action: 'index' },
      { name: 'theme_option.index', guard_name: 'web', resource: 'theme_option', action: 'index' },

      // Stores
      { name: 'store.index', guard_name: 'web', resource: 'store', action: 'index' },
      { name: 'store.create', guard_name: 'web', resource: 'store', action: 'create' },
      { name: 'vendor_wallet.index', guard_name: 'web', resource: 'vendor_wallet', action: 'index' },
      { name: 'commission_history.index', guard_name: 'web', resource: 'commission_history', action: 'index' },
      { name: 'withdraw_request.index', guard_name: 'web', resource: 'withdraw_request', action: 'index' },

      // Blog
      { name: 'blog.index', guard_name: 'web', resource: 'blog', action: 'index' },

      // Media
      { name: 'attachment.index', guard_name: 'web', resource: 'attachment', action: 'index' },

      // Pages
      { name: 'page.index', guard_name: 'web', resource: 'page', action: 'index' },

      // Taxes
      { name: 'tax.index', guard_name: 'web', resource: 'tax', action: 'index' },

      // Shipping
      { name: 'shipping.index', guard_name: 'web', resource: 'shipping', action: 'index' },

      // Coupons
      { name: 'coupon.index', guard_name: 'web', resource: 'coupon', action: 'index' },

      // Currencies
      { name: 'currency.index', guard_name: 'web', resource: 'currency', action: 'index' },

      // Points
      { name: 'point.index', guard_name: 'web', resource: 'point', action: 'index' },

      // Wallet
      { name: 'wallet.index', guard_name: 'web', resource: 'wallet', action: 'index' },

      // Refund
      { name: 'refund.index', guard_name: 'web', resource: 'refund', action: 'index' },

      // Reviews
      { name: 'review.index', guard_name: 'web', resource: 'review', action: 'index' },

      // FAQs
      { name: 'faq.index', guard_name: 'web', resource: 'faq', action: 'index' },

      // Notices
      { name: 'notice.index', guard_name: 'web', resource: 'notice', action: 'index' },

      // Subscriptions
      { name: 'subscribe.index', guard_name: 'web', resource: 'subscribe', action: 'index' },

      // Settings
      { name: 'setting.index', guard_name: 'web', resource: 'setting', action: 'index' },

      // Attributes
      { name: 'attribute.index', guard_name: 'web', resource: 'attribute', action: 'index' },

      // Tags
      { name: 'tag.index', guard_name: 'web', resource: 'tag', action: 'index' },

      // Brands
      { name: 'brand.index', guard_name: 'web', resource: 'brand', action: 'index' }
    ];

    console.log(`📋 Agregando ${missingPermissions.length} permisos faltantes...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const permissionData of missingPermissions) {
      // Verificar si el permiso ya existe
      const existingPermission = await PermissionModel.findOne({ name: permissionData.name });
      
      if (existingPermission) {
        console.log(`   ⚠️ Permiso ya existe: ${permissionData.name}`);
        skippedCount++;
        continue;
      }

      // Crear nuevo permiso
      const newPermission = new PermissionModel(permissionData);
      await (newPermission as any).save();
      console.log(`   ✅ Permiso agregado: ${permissionData.name} (ID: ${(newPermission as any).id})`);
      addedCount++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Permisos agregados: ${addedCount}`);
    console.log(`   ⚠️ Permisos ya existentes: ${skippedCount}`);
    console.log(`   📋 Total procesados: ${missingPermissions.length}`);

    // Asignar todos los permisos al rol admin
    console.log('\n🛡️ Asignando permisos al rol admin...');
    
    const adminRole = await RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('   ❌ Rol admin no encontrado');
      return;
    }

    console.log(`   ✅ Rol admin encontrado (ID: ${(adminRole as any).id})`);

    // Obtener todos los permisos (incluyendo los nuevos)
    const allPermissions = await PermissionModel.find({});
    console.log(`   📊 Total de permisos en BD: ${allPermissions.length}`);

    // Verificar permisos ya asignados al rol admin
    const existingRolePermissions = await RolePermissionModel.find({ role_id: (adminRole as any).id });
    console.log(`   📋 Permisos ya asignados al rol admin: ${existingRolePermissions.length}`);

    // Crear relaciones para permisos no asignados
    const assignedPermissionIds = existingRolePermissions.map((rp: any) => rp.permission_id);
    const unassignedPermissions = allPermissions.filter((perm: any) => !assignedPermissionIds.includes(perm.id));

    if (unassignedPermissions.length > 0) {
      console.log(`   🔄 Asignando ${unassignedPermissions.length} permisos no asignados...`);
      
      const newRolePermissions = unassignedPermissions.map((permission: any) => ({
        role_id: (adminRole as any).id,
        permission_id: permission.id
      }));

      await RolePermissionModel.insertMany(newRolePermissions);
      console.log(`   ✅ ${newRolePermissions.length} permisos asignados al rol admin`);
    } else {
      console.log(`   ✅ Todos los permisos ya están asignados al rol admin`);
    }

    // Verificación final
    const finalRolePermissions = await RolePermissionModel.find({ role_id: (adminRole as any).id });
    console.log(`\n🎯 Estado final:`);
    console.log(`   📊 Total de permisos en BD: ${allPermissions.length}`);
    console.log(`   🛡️ Permisos asignados al rol admin: ${finalRolePermissions.length}`);

    console.log('\n🎉 ¡Permisos faltantes agregados exitosamente!');

  } catch (error) {
    console.error('❌ Error al agregar permisos faltantes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

addMissingPermissions().catch(error => {
  console.error('Error en el script de permisos faltantes:', error);
  process.exit(1);
});

