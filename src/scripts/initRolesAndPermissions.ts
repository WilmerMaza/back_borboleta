import mongoose from 'mongoose';
import RoleModel from '../infrastructure/database/models/RoleModel';
import PermissionModel from '../infrastructure/database/models/PermissionModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function initRolesAndPermissions() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear permisos básicos
    const permissions = [
      { name: 'read', description: 'Permiso de lectura', resource: 'all', action: 'read' },
      { name: 'write', description: 'Permiso de escritura', resource: 'all', action: 'write' },
      { name: 'delete', description: 'Permiso de eliminación', resource: 'all', action: 'delete' },
      { name: 'users.read', description: 'Leer usuarios', resource: 'users', action: 'read' },
      { name: 'users.write', description: 'Escribir usuarios', resource: 'users', action: 'write' },
      { name: 'users.delete', description: 'Eliminar usuarios', resource: 'users', action: 'delete' },
      { name: 'products.read', description: 'Leer productos', resource: 'products', action: 'read' },
      { name: 'products.write', description: 'Escribir productos', resource: 'products', action: 'write' },
      { name: 'products.delete', description: 'Eliminar productos', resource: 'products', action: 'delete' },
      { name: 'orders.read', description: 'Leer órdenes', resource: 'orders', action: 'read' },
      { name: 'orders.write', description: 'Escribir órdenes', resource: 'orders', action: 'write' },
      { name: 'orders.delete', description: 'Eliminar órdenes', resource: 'orders', action: 'delete' }
    ];

    console.log('🔄 Creando permisos...');
    const createdPermissions = [];
    
    for (const permissionData of permissions) {
      const existingPermission = await PermissionModel.findOne({ name: permissionData.name });
      if (!existingPermission) {
        const permission = new PermissionModel(permissionData);
        await permission.save();
        createdPermissions.push(permission);
        console.log(`   ✅ Permiso creado: ${permission.name}`);
      } else {
        createdPermissions.push(existingPermission);
        console.log(`   ⚠️  Permiso ya existe: ${permissionData.name}`);
      }
    }

    // Crear roles básicos
    const roles = [
      {
        name: 'admin',
        description: 'Administrador con todos los permisos',
        permissions: createdPermissions.map(p => p._id)
      },
      {
        name: 'user',
        description: 'Usuario básico con permisos limitados',
        permissions: createdPermissions
          .filter(p => p.name.includes('read'))
          .map(p => p._id)
      },
      {
        name: 'moderator',
        description: 'Moderador con permisos de lectura y escritura',
        permissions: createdPermissions
          .filter(p => p.name.includes('read') || p.name.includes('write'))
          .map(p => p._id)
      }
    ];

    console.log('🔄 Creando roles...');
    
    for (const roleData of roles) {
      const existingRole = await RoleModel.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new RoleModel(roleData);
        await role.save();
        console.log(`   ✅ Rol creado: ${role.name}`);
      } else {
        console.log(`   ⚠️  Rol ya existe: ${roleData.name}`);
      }
    }

    console.log('🎉 Roles y permisos inicializados exitosamente!');
    
    // Mostrar resumen
    const allRoles = await RoleModel.find().populate('permissions');
    const allPermissions = await PermissionModel.find();
    
    console.log('\n📋 Resumen:');
    console.log(`   Roles: ${allRoles.length}`);
    console.log(`   Permisos: ${allPermissions.length}`);
    
    allRoles.forEach(role => {
      console.log(`   - ${role.name}: ${role.permissions.length} permisos`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar roles y permisos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
initRolesAndPermissions();

