import mongoose from 'mongoose';
import RoleModel from '../infrastructure/database/models/RoleModel';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function initSpecificPermissions() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear permisos específicos basados en la aplicación
    const permissions = [
      // Usuarios
      { name: 'user.index', guard_name: 'web', resource: 'users', action: 'read' },
      { name: 'user.create', guard_name: 'web', resource: 'users', action: 'create' },
      { name: 'user.edit', guard_name: 'web', resource: 'users', action: 'update' },
      { name: 'user.destroy', guard_name: 'web', resource: 'users', action: 'delete' },

      // Roles
      { name: 'role.index', guard_name: 'web', resource: 'roles', action: 'read' },
      { name: 'role.create', guard_name: 'web', resource: 'roles', action: 'create' },
      { name: 'role.edit', guard_name: 'web', resource: 'roles', action: 'update' },
      { name: 'role.destroy', guard_name: 'web', resource: 'roles', action: 'delete' },

      // Productos
      { name: 'product.index', guard_name: 'web', resource: 'products', action: 'read' },
      { name: 'product.create', guard_name: 'web', resource: 'products', action: 'create' },
      { name: 'product.edit', guard_name: 'web', resource: 'products', action: 'update' },
      { name: 'product.destroy', guard_name: 'web', resource: 'products', action: 'delete' },

      // Categorías
      { name: 'category.index', guard_name: 'web', resource: 'categories', action: 'read' },
      { name: 'category.create', guard_name: 'web', resource: 'categories', action: 'create' },
      { name: 'category.edit', guard_name: 'web', resource: 'categories', action: 'update' },
      { name: 'category.destroy', guard_name: 'web', resource: 'categories', action: 'delete' },

      // Órdenes
      { name: 'order.index', guard_name: 'web', resource: 'orders', action: 'read' },
      { name: 'order.create', guard_name: 'web', resource: 'orders', action: 'create' },
      { name: 'order.edit', guard_name: 'web', resource: 'orders', action: 'update' },

      // Configuraciones
      { name: 'setting.index', guard_name: 'web', resource: 'settings', action: 'read' },
      { name: 'setting.edit', guard_name: 'web', resource: 'settings', action: 'update' },

      // Carrito
      { name: 'cart.index', guard_name: 'web', resource: 'cart', action: 'read' },
      { name: 'cart.create', guard_name: 'web', resource: 'cart', action: 'create' },
      { name: 'cart.edit', guard_name: 'web', resource: 'cart', action: 'update' },
      { name: 'cart.destroy', guard_name: 'web', resource: 'cart', action: 'delete' },

      // Checkout
      { name: 'checkout.index', guard_name: 'web', resource: 'checkout', action: 'read' },
      { name: 'checkout.create', guard_name: 'web', resource: 'checkout', action: 'create' },

      // Direcciones
      { name: 'address.index', guard_name: 'web', resource: 'addresses', action: 'read' },
      { name: 'address.create', guard_name: 'web', resource: 'addresses', action: 'create' },
      { name: 'address.edit', guard_name: 'web', resource: 'addresses', action: 'update' },
      { name: 'address.destroy', guard_name: 'web', resource: 'addresses', action: 'delete' }
    ];

    console.log('🔄 Creando permisos específicos...');
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

    // Crear roles específicos
    const roles = [
      {
        name: 'admin',
        guard_name: 'web',
        system_reserve: 1, // Rol del sistema
        description: 'Administrador con todos los permisos',
        permissions: createdPermissions.map(p => p._id)
      },
      {
        name: 'user',
        guard_name: 'web',
        system_reserve: 1, // Rol del sistema
        description: 'Usuario básico con permisos limitados',
        permissions: createdPermissions
          .filter(p => p.name.includes('index') || p.name.includes('read'))
          .map(p => p._id)
      },
      {
        name: 'moderator',
        guard_name: 'web',
        system_reserve: 0,
        description: 'Moderador con permisos de lectura y escritura',
        permissions: createdPermissions
          .filter(p => p.name.includes('index') || p.name.includes('create') || p.name.includes('edit'))
          .map(p => p._id)
      },
      {
        name: 'editor',
        guard_name: 'web',
        system_reserve: 0,
        description: 'Editor con permisos de productos y categorías',
        permissions: createdPermissions
          .filter(p => 
            p.name.includes('product.') || 
            p.name.includes('category.') || 
            p.name.includes('index')
          )
          .map(p => p._id)
      }
    ];

    console.log('🔄 Creando roles específicos...');
    
    for (const roleData of roles) {
      const existingRole = await RoleModel.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new RoleModel(roleData);
        await role.save();
        
        // Crear relaciones en la tabla pivot
        const rolePermissions = roleData.permissions.map((permissionId: any) => ({
          role_id: role.id,
          permission_id: createdPermissions.find(p => p._id.toString() === permissionId.toString())?.id
        })).filter(rp => rp.permission_id); // Filtrar permisos válidos

        if (rolePermissions.length > 0) {
          await RolePermissionModel.insertMany(rolePermissions);
        }
        
        console.log(`   ✅ Rol creado: ${role.name} con ${rolePermissions.length} permisos`);
      } else {
        console.log(`   ⚠️  Rol ya existe: ${roleData.name}`);
      }
    }

    console.log('🎉 Permisos y roles específicos inicializados exitosamente!');
    
    // Mostrar resumen
    const allRoles = await RoleModel.find().populate('permissions');
    const allPermissions = await PermissionModel.find();
    
    console.log('\n📋 Resumen:');
    console.log(`   Roles: ${allRoles.length}`);
    console.log(`   Permisos: ${allPermissions.length}`);
    
    allRoles.forEach(role => {
      console.log(`   - ${role.name} (${role.system_reserve === 1 ? 'Sistema' : 'Personalizado'}): ${role.permissions.length} permisos`);
    });

    // Mostrar permisos por módulo
    console.log('\n📋 Permisos por módulo:');
    const modules = ['user', 'role', 'product', 'category', 'order', 'setting', 'cart', 'checkout', 'address'];
    modules.forEach(module => {
      const modulePermissions = allPermissions.filter(p => p.name.startsWith(`${module}.`));
      console.log(`   - ${module}: ${modulePermissions.length} permisos`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar permisos específicos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
initSpecificPermissions();

