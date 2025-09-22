import 'reflect-metadata';
import mongoose from 'mongoose';
import UserModel from '../infrastructure/database/models/UserModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import { AuthService } from '../application/services/AuthService';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function createSuperAdmin() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const authService = new AuthService();

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email: 'borboleta@gmail.com' });
    if (existingUser) {
      console.log('⚠️  El usuario super administrador ya existe');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Nombre: ${existingUser.name}`);
      return;
    }

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
        { name: 'setting.edit', guard_name: 'web', resource: 'settings', action: 'update' }
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

    // Hash de la contraseña
    const hashedPassword = await authService.hashPassword('1234');

    // Crear usuario super administrador
    const superAdminData = {
      name: 'Super Administrador',
      email: 'borboleta@gmail.com',
      password: hashedPassword,
      phone: '0000000000',
      country_code: 1,
      role_id: (adminRole as any).id,
      status: true,
      is_approved: true
    };

    const superAdmin = new UserModel(superAdminData);
    await superAdmin.save();

    console.log('🎉 Usuario super administrador creado exitosamente!');
    console.log('📋 Detalles del usuario:');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Nombre: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: 1234`);
    console.log(`   Rol: ${(adminRole as any).name}`);
    console.log(`   Permisos: ${(adminRole as any).permissions.length}`);

    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Email: borboleta@gmail.com');
    console.log('   Password: 1234');
    console.log('\n📡 Endpoint de login:');
    console.log('   POST http://localhost:3001/api/users/login');

  } catch (error) {
    console.error('❌ Error al crear super administrador:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
createSuperAdmin();
