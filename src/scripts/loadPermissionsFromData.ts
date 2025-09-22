import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import connectDB from '../infrastructure/database/config/database';

async function loadPermissionsFromData() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Permisos extraídos del JSON que proporcionaste
    const permissions = [
      { name: 'user.index', guard_name: 'web' },
      { name: 'user.create', guard_name: 'web' },
      { name: 'user.edit', guard_name: 'web' },
      { name: 'user.destroy', guard_name: 'web' },
      { name: 'role.index', guard_name: 'web' },
      { name: 'role.create', guard_name: 'web' },
      { name: 'role.edit', guard_name: 'web' },
      { name: 'role.destroy', guard_name: 'web' },
      { name: 'product.index', guard_name: 'web' },
      { name: 'product.create', guard_name: 'web' },
      { name: 'product.edit', guard_name: 'web' },
      { name: 'product.destroy', guard_name: 'web' },
      { name: 'attribute.index', guard_name: 'web' },
      { name: 'attribute.create', guard_name: 'web' },
      { name: 'attribute.edit', guard_name: 'web' },
      { name: 'attribute.destroy', guard_name: 'web' },
      { name: 'category.index', guard_name: 'web' },
      { name: 'category.create', guard_name: 'web' },
      { name: 'category.edit', guard_name: 'web' },
      { name: 'category.destroy', guard_name: 'web' },
      { name: 'tag.index', guard_name: 'web' },
      { name: 'tag.create', guard_name: 'web' },
      { name: 'tag.edit', guard_name: 'web' },
      { name: 'tag.destroy', guard_name: 'web' },
      { name: 'brand.index', guard_name: 'web' },
      { name: 'brand.create', guard_name: 'web' },
      { name: 'brand.edit', guard_name: 'web' },
      { name: 'brand.destroy', guard_name: 'web' },
      { name: 'license_key.index', guard_name: 'web' },
      { name: 'license_key.create', guard_name: 'web' },
      { name: 'license_key.edit', guard_name: 'web' },
      { name: 'license_key.destroy', guard_name: 'web' },
      { name: 'store.index', guard_name: 'web' },
      { name: 'store.create', guard_name: 'web' },
      { name: 'store.edit', guard_name: 'web' },
      { name: 'store.destroy', guard_name: 'web' },
      { name: 'vendor_wallet.index', guard_name: 'web' },
      { name: 'vendor_wallet.credit', guard_name: 'web' },
      { name: 'vendor_wallet.debit', guard_name: 'web' },
      { name: 'commission_history.index', guard_name: 'web' },
      { name: 'withdraw_request.index', guard_name: 'web' },
      { name: 'withdraw_request.create', guard_name: 'web' },
      { name: 'withdraw_request.action', guard_name: 'web' },
      { name: 'order.index', guard_name: 'web' },
      { name: 'order.create', guard_name: 'web' },
      { name: 'order.edit', guard_name: 'web' },
      { name: 'attachment.index', guard_name: 'web' },
      { name: 'attachment.create', guard_name: 'web' },
      { name: 'attachment.destroy', guard_name: 'web' },
      { name: 'blog.index', guard_name: 'web' },
      { name: 'blog.create', guard_name: 'web' },
      { name: 'blog.edit', guard_name: 'web' },
      { name: 'blog.destroy', guard_name: 'web' },
      { name: 'page.index', guard_name: 'web' },
      { name: 'page.create', guard_name: 'web' },
      { name: 'page.edit', guard_name: 'web' },
      { name: 'page.destroy', guard_name: 'web' },
      { name: 'tax.index', guard_name: 'web' },
      { name: 'tax.create', guard_name: 'web' },
      { name: 'tax.edit', guard_name: 'web' },
      { name: 'tax.destroy', guard_name: 'web' },
      { name: 'shipping.index', guard_name: 'web' },
      { name: 'shipping.create', guard_name: 'web' },
      { name: 'shipping.edit', guard_name: 'web' },
      { name: 'shipping.destroy', guard_name: 'web' },
      { name: 'coupon.index', guard_name: 'web' },
      { name: 'coupon.create', guard_name: 'web' },
      { name: 'coupon.edit', guard_name: 'web' },
      { name: 'coupon.destroy', guard_name: 'web' },
      { name: 'currency.index', guard_name: 'web' },
      { name: 'currency.create', guard_name: 'web' },
      { name: 'currency.edit', guard_name: 'web' },
      { name: 'currency.destroy', guard_name: 'web' },
      { name: 'point.index', guard_name: 'web' },
      { name: 'point.credit', guard_name: 'web' },
      { name: 'point.debit', guard_name: 'web' },
      { name: 'wallet.index', guard_name: 'web' },
      { name: 'wallet.credit', guard_name: 'web' },
      { name: 'wallet.debit', guard_name: 'web' },
      { name: 'refund.index', guard_name: 'web' },
      { name: 'refund.create', guard_name: 'web' },
      { name: 'refund.action', guard_name: 'web' },
      { name: 'review.index', guard_name: 'web' },
      { name: 'review.create', guard_name: 'web' },
      { name: 'review.destroy', guard_name: 'web' },
      { name: 'faq.index', guard_name: 'web' },
      { name: 'faq.create', guard_name: 'web' },
      { name: 'faq.edit', guard_name: 'web' },
      { name: 'faq.destroy', guard_name: 'web' },
      { name: 'question_and_answer.index', guard_name: 'web' },
      { name: 'question_and_answer.create', guard_name: 'web' },
      { name: 'question_and_answer.edit', guard_name: 'web' },
      { name: 'question_and_answer.destroy', guard_name: 'web' },
      { name: 'subscribe.index', guard_name: 'web' },
      { name: 'subscribe.create', guard_name: 'web' },
      { name: 'subscribe.edit', guard_name: 'web' },
      { name: 'subscribe.destroy', guard_name: 'web' },
      { name: 'notice.index', guard_name: 'web' },
      { name: 'notice.create', guard_name: 'web' },
      { name: 'notice.edit', guard_name: 'web' },
      { name: 'notice.destroy', guard_name: 'web' },
      { name: 'theme.index', guard_name: 'web' },
      { name: 'theme.edit', guard_name: 'web' },
      { name: 'theme_option.index', guard_name: 'web' },
      { name: 'theme_option.edit', guard_name: 'web' },
      { name: 'menu.index', guard_name: 'web' },
      { name: 'menu.create', guard_name: 'web' },
      { name: 'menu.edit', guard_name: 'web' },
      { name: 'menu.destroy', guard_name: 'web' },
      { name: 'app_setting.index', guard_name: 'web' },
      { name: 'app_setting.edit', guard_name: 'web' },
      { name: 'setting.index', guard_name: 'web' },
      { name: 'setting.edit', guard_name: 'web' }
    ];

    console.log(`📋 Cargando ${permissions.length} permisos...`);

    // Limpiar permisos existentes
    console.log('🗑️ Limpiando permisos existentes...');
    await PermissionModel.deleteMany({});
    await RolePermissionModel.deleteMany({});
    console.log('   ✅ Permisos existentes eliminados');

    // Crear permisos
    console.log('🔑 Creando permisos...');
    let createdCount = 0;

    for (const perm of permissions) {
      const permissionData = {
        name: perm.name,
        guard_name: perm.guard_name,
        resource: perm.name.split('.')[0],
        action: perm.name.split('.')[1] || 'index',
        description: `${perm.name} permission`
      };

      const newPermission = new PermissionModel(permissionData);
      await (newPermission as any).save();
      
      console.log(`   ✅ Permiso creado: ${perm.name}`);
      createdCount++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Permisos creados: ${createdCount}`);

    // Crear o verificar rol admin
    console.log('\n🛡️ Configurando rol admin...');
    let adminRole = await RoleModel.findOne({ name: 'admin' });
    
    if (!adminRole) {
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

    // Asignar todos los permisos al rol admin
    console.log('\n🔗 Asignando permisos al rol admin...');
    const allPermissions = await PermissionModel.find({});
    console.log(`   📊 Total de permisos en BD: ${allPermissions.length}`);

    const rolePermissions = allPermissions.map((permission: any) => ({
      role_id: (adminRole as any).id,
      permission_id: permission.id
    }));

    await RolePermissionModel.insertMany(rolePermissions);
    console.log(`   ✅ ${rolePermissions.length} permisos asignados al rol admin`);

    // Verificación final
    const finalRolePermissions = await RolePermissionModel.find({ role_id: (adminRole as any).id });
    console.log(`\n🎯 Estado final:`);
    console.log(`   📊 Total de permisos en BD: ${allPermissions.length}`);
    console.log(`   🛡️ Permisos asignados al rol admin: ${finalRolePermissions.length}`);

    console.log('\n🎉 ¡Permisos cargados exitosamente!');

  } catch (error) {
    console.error('❌ Error al cargar permisos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

loadPermissionsFromData().catch(error => {
  console.error('Error en el script de carga de permisos:', error);
  process.exit(1);
});

