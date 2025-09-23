import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import connectDB from '../infrastructure/database/config/database';

async function loadPermissionsFromJSON() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Leer el archivo JSON de permisos
    const jsonPath = path.join(__dirname, '../infrastructure/database/models/permise.json');
    console.log('📄 Leyendo archivo JSON:', jsonPath);
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Archivo JSON no encontrado:', jsonPath);
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log('📋 Datos JSON cargados exitosamente');

    // Extraer permisos del JSON
    const permissions = jsonData.permission || [];
    console.log(`📊 Total de permisos en JSON: ${permissions.length}`);

    if (permissions.length === 0) {
      console.log('❌ No se encontraron permisos en el archivo JSON');
      return;
    }

    // Limpiar permisos existentes
    console.log('🗑️ Limpiando permisos existentes...');
    await PermissionModel.deleteMany({});
    await RolePermissionModel.deleteMany({});
    console.log('   ✅ Permisos existentes eliminados');

    // Crear permisos desde el JSON
    console.log('🔑 Creando permisos desde JSON...');
    let createdCount = 0;
    const permissionMap = new Map();

    for (const perm of permissions) {
      const permissionData = {
        name: perm.name,
        guard_name: perm.guard_name,
        resource: perm.name.split('.')[0], // Extraer recurso del nombre
        action: perm.name.split('.')[1] || 'index', // Extraer acción del nombre
        description: `${perm.name} permission`
      };

      const newPermission = new PermissionModel(permissionData);
      await (newPermission as any).save();
      
      // Guardar mapeo de ID original a nuevo ID
      permissionMap.set(perm.id, (newPermission as any).id);
      
      console.log(`   ✅ Permiso creado: ${perm.name} (ID original: ${perm.id} -> ID nuevo: ${(newPermission as any).id})`);
      createdCount++;
    }

    console.log(`\n📊 Resumen de permisos creados:`);
    console.log(`   ✅ Permisos creados: ${createdCount}`);

    // Crear o verificar rol admin
    console.log('\n🛡️ Configurando rol admin...');
    let adminRole = await RoleModel.findOne({ name: 'admin' });
    
    if (!adminRole) {
      console.log('   🔄 Creando rol admin...');
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

    // Mostrar algunos permisos de ejemplo
    console.log('\n📋 Ejemplos de permisos creados:');
    const samplePermissions = allPermissions.slice(0, 10);
    samplePermissions.forEach((perm: any, index) => {
      console.log(`   ${index + 1}. ${perm.name} (${perm.resource}.${perm.action})`);
    });

    console.log('\n🎉 ¡Permisos cargados exitosamente desde JSON!');

  } catch (error) {
    console.error('❌ Error al cargar permisos desde JSON:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

loadPermissionsFromJSON().catch(error => {
  console.error('Error en el script de carga de permisos desde JSON:', error);
  process.exit(1);
});

