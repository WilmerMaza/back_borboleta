import mongoose from 'mongoose';
import UserModel from '../infrastructure/database/models/UserModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function assignAdminPermissions() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const userEmail = 'alfa3@gmail.com'; // Usar el usuario que está funcionando en el login

    // Buscar el usuario
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Rol actual: ${user.role_id}`);

    // Crear o obtener el rol de admin
    let adminRole = await RoleModel.findOne({ name: 'admin' });
    
    if (!adminRole) {
      console.log('🔄 Creando rol de administrador...');
      
      // Crear permisos básicos si no existen
      const permissions = [
        { name: 'user.index', guard_name: 'web', resource: 'users', action: 'read' },
        { name: 'user.create', guard_name: 'web', resource: 'users', action: 'create' },
        { name: 'user.edit', guard_name: 'web', resource: 'users', action: 'update' },
        { name: 'user.destroy', guard_name: 'web', resource: 'users', action: 'delete' },
        { name: 'role.index', guard_name: 'web', resource: 'roles', action: 'read' },
        { name: 'role.create', guard_name: 'web', resource: 'roles', action: 'create' },
        { name: 'role.edit', guard_name: 'web', resource: 'roles', action: 'update' },
        { name: 'role.destroy', guard_name: 'web', resource: 'roles', action: 'delete' },
        { name: 'product.index', guard_name: 'web', resource: 'products', action: 'read' },
        { name: 'product.create', guard_name: 'web', resource: 'products', action: 'create' },
        { name: 'product.edit', guard_name: 'web', resource: 'products', action: 'update' },
        { name: 'product.destroy', guard_name: 'web', resource: 'products', action: 'delete' },
        { name: 'category.index', guard_name: 'web', resource: 'categories', action: 'read' },
        { name: 'category.create', guard_name: 'web', resource: 'categories', action: 'create' },
        { name: 'category.edit', guard_name: 'web', resource: 'categories', action: 'update' },
        { name: 'category.destroy', guard_name: 'web', resource: 'categories', action: 'delete' },
        { name: 'order.index', guard_name: 'web', resource: 'orders', action: 'read' },
        { name: 'order.create', guard_name: 'web', resource: 'orders', action: 'create' },
        { name: 'order.edit', guard_name: 'web', resource: 'orders', action: 'update' },
        { name: 'setting.index', guard_name: 'web', resource: 'settings', action: 'read' },
        { name: 'setting.edit', guard_name: 'web', resource: 'settings', action: 'update' },
        { name: 'cart.index', guard_name: 'web', resource: 'cart', action: 'read' },
        { name: 'cart.create', guard_name: 'web', resource: 'cart', action: 'create' },
        { name: 'cart.edit', guard_name: 'web', resource: 'cart', action: 'update' },
        { name: 'cart.destroy', guard_name: 'web', resource: 'cart', action: 'delete' },
        { name: 'checkout.index', guard_name: 'web', resource: 'checkout', action: 'read' },
        { name: 'checkout.create', guard_name: 'web', resource: 'checkout', action: 'create' },
        { name: 'address.index', guard_name: 'web', resource: 'address', action: 'read' },
        { name: 'address.create', guard_name: 'web', resource: 'address', action: 'create' },
        { name: 'address.edit', guard_name: 'web', resource: 'address', action: 'update' },
        { name: 'address.destroy', guard_name: 'web', resource: 'address', action: 'delete' }
      ];

      const createdPermissions = [];
      for (const permissionData of permissions) {
        const existingPermission = await PermissionModel.findOne({ name: permissionData.name });
        if (!existingPermission) {
          const permission = new PermissionModel(permissionData);
          await (permission as any).save();
          createdPermissions.push(permission);
          console.log(`   ✅ Permiso creado: ${(permission as any).name}`);
        } else {
          createdPermissions.push(existingPermission);
        }
      }

      // Crear rol de admin
      adminRole = new RoleModel({
        name: 'admin',
        guard_name: 'web',
        system_reserve: 1, // Rol del sistema
        description: 'Super administrador con todos los permisos',
        permissions: createdPermissions.map((p: any) => p._id)
      });
      await (adminRole as any).save();

      // Crear relaciones en la tabla pivot
      const rolePermissions = createdPermissions.map((permission: any) => ({
        role_id: (adminRole as any).id,
        permission_id: permission.id
      }));

      await RolePermissionModel.insertMany(rolePermissions);
      console.log(`   ✅ Rol de administrador creado con ${rolePermissions.length} permisos`);
    } else {
      console.log('✅ Rol de administrador ya existe');
    }

    // Asignar rol de admin al usuario
    user.role_id = (adminRole as any).id;
    await (user as any).save();

    console.log('🎉 Usuario actualizado exitosamente!');
    console.log('📋 Detalles del usuario:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Rol: ${(adminRole as any).name}`);
    console.log(`   Permisos: ${(adminRole as any).permissions.length}`);

    console.log('\n🔐 El usuario ahora tiene permisos de administrador completo!');

  } catch (error) {
    console.error('❌ Error al asignar permisos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
assignAdminPermissions();
