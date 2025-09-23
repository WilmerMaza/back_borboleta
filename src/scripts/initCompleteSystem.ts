import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../infrastructure/database/models/UserModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function initCompleteSystem() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // 1. Crear rol Super Administrador
    console.log('🔄 Creando rol Super Administrador...');
    let superAdminRole = await RoleModel.findOne({ name: 'Super Administrador' });
    
    if (!superAdminRole) {
      superAdminRole = new RoleModel({
        name: 'Super Administrador',
        guard_name: 'web',
        system_reserve: 1,
        description: 'Super administrador con acceso completo al sistema'
      });
      await (superAdminRole as any).save();
      console.log('   ✅ Rol Super Administrador creado');
    } else {
      console.log('   ⏭️ Rol Super Administrador ya existe');
    }

    // 2. Crear todos los permisos del sistema
    console.log('🔄 Creando permisos del sistema...');
    const permissions = [
      // Usuarios
      { name: 'user.index', guard_name: 'web', resource: 'users', action: 'index' },
      { name: 'user.create', guard_name: 'web', resource: 'users', action: 'create' },
      { name: 'user.edit', guard_name: 'web', resource: 'users', action: 'edit' },
      { name: 'user.destroy', guard_name: 'web', resource: 'users', action: 'destroy' },
      { name: 'user.show', guard_name: 'web', resource: 'users', action: 'show' },

      // Roles
      { name: 'role.index', guard_name: 'web', resource: 'roles', action: 'index' },
      { name: 'role.create', guard_name: 'web', resource: 'roles', action: 'create' },
      { name: 'role.edit', guard_name: 'web', resource: 'roles', action: 'edit' },
      { name: 'role.destroy', guard_name: 'web', resource: 'roles', action: 'destroy' },
      { name: 'role.show', guard_name: 'web', resource: 'roles', action: 'show' },

      // Productos
      { name: 'product.index', guard_name: 'web', resource: 'products', action: 'index' },
      { name: 'product.create', guard_name: 'web', resource: 'products', action: 'create' },
      { name: 'product.edit', guard_name: 'web', resource: 'products', action: 'edit' },
      { name: 'product.destroy', guard_name: 'web', resource: 'products', action: 'destroy' },
      { name: 'product.show', guard_name: 'web', resource: 'products', action: 'show' },

      // Categorías
      { name: 'category.index', guard_name: 'web', resource: 'categories', action: 'index' },
      { name: 'category.create', guard_name: 'web', resource: 'categories', action: 'create' },
      { name: 'category.edit', guard_name: 'web', resource: 'categories', action: 'edit' },
      { name: 'category.destroy', guard_name: 'web', resource: 'categories', action: 'destroy' },
      { name: 'category.show', guard_name: 'web', resource: 'categories', action: 'show' },

      // Marcas
      { name: 'brand.index', guard_name: 'web', resource: 'brands', action: 'index' },
      { name: 'brand.create', guard_name: 'web', resource: 'brands', action: 'create' },
      { name: 'brand.edit', guard_name: 'web', resource: 'brands', action: 'edit' },
      { name: 'brand.destroy', guard_name: 'web', resource: 'brands', action: 'destroy' },
      { name: 'brand.show', guard_name: 'web', resource: 'brands', action: 'show' },

      // Pedidos
      { name: 'order.index', guard_name: 'web', resource: 'orders', action: 'index' },
      { name: 'order.create', guard_name: 'web', resource: 'orders', action: 'create' },
      { name: 'order.edit', guard_name: 'web', resource: 'orders', action: 'edit' },
      { name: 'order.destroy', guard_name: 'web', resource: 'orders', action: 'destroy' },
      { name: 'order.show', guard_name: 'web', resource: 'orders', action: 'show' },

      // Tiendas
      { name: 'store.index', guard_name: 'web', resource: 'stores', action: 'index' },
      { name: 'store.create', guard_name: 'web', resource: 'stores', action: 'create' },
      { name: 'store.edit', guard_name: 'web', resource: 'stores', action: 'edit' },
      { name: 'store.destroy', guard_name: 'web', resource: 'stores', action: 'destroy' },
      { name: 'store.show', guard_name: 'web', resource: 'stores', action: 'show' },

      // Cupones
      { name: 'coupon.index', guard_name: 'web', resource: 'coupons', action: 'index' },
      { name: 'coupon.create', guard_name: 'web', resource: 'coupons', action: 'create' },
      { name: 'coupon.edit', guard_name: 'web', resource: 'coupons', action: 'edit' },
      { name: 'coupon.destroy', guard_name: 'web', resource: 'coupons', action: 'destroy' },
      { name: 'coupon.show', guard_name: 'web', resource: 'coupons', action: 'show' },

      // Blogs
      { name: 'blog.index', guard_name: 'web', resource: 'blogs', action: 'index' },
      { name: 'blog.create', guard_name: 'web', resource: 'blogs', action: 'create' },
      { name: 'blog.edit', guard_name: 'web', resource: 'blogs', action: 'edit' },
      { name: 'blog.destroy', guard_name: 'web', resource: 'blogs', action: 'destroy' },
      { name: 'blog.show', guard_name: 'web', resource: 'blogs', action: 'show' },

      // Páginas
      { name: 'page.index', guard_name: 'web', resource: 'pages', action: 'index' },
      { name: 'page.create', guard_name: 'web', resource: 'pages', action: 'create' },
      { name: 'page.edit', guard_name: 'web', resource: 'pages', action: 'edit' },
      { name: 'page.destroy', guard_name: 'web', resource: 'pages', action: 'destroy' },
      { name: 'page.show', guard_name: 'web', resource: 'pages', action: 'show' },

      // FAQs
      { name: 'faq.index', guard_name: 'web', resource: 'faqs', action: 'index' },
      { name: 'faq.create', guard_name: 'web', resource: 'faqs', action: 'create' },
      { name: 'faq.edit', guard_name: 'web', resource: 'faqs', action: 'edit' },
      { name: 'faq.destroy', guard_name: 'web', resource: 'faqs', action: 'destroy' },
      { name: 'faq.show', guard_name: 'web', resource: 'faqs', action: 'show' },

      // Temas
      { name: 'theme.index', guard_name: 'web', resource: 'themes', action: 'index' },
      { name: 'theme.create', guard_name: 'web', resource: 'themes', action: 'create' },
      { name: 'theme.edit', guard_name: 'web', resource: 'themes', action: 'edit' },
      { name: 'theme.destroy', guard_name: 'web', resource: 'themes', action: 'destroy' },
      { name: 'theme.show', guard_name: 'web', resource: 'themes', action: 'show' },

      // Configuraciones
      { name: 'setting.index', guard_name: 'web', resource: 'settings', action: 'index' },
      { name: 'setting.create', guard_name: 'web', resource: 'settings', action: 'create' },
      { name: 'setting.edit', guard_name: 'web', resource: 'settings', action: 'edit' },
      { name: 'setting.destroy', guard_name: 'web', resource: 'settings', action: 'destroy' },
      { name: 'setting.show', guard_name: 'web', resource: 'settings', action: 'show' },

      // Reportes
      { name: 'report.index', guard_name: 'web', resource: 'reports', action: 'index' },
      { name: 'report.export', guard_name: 'web', resource: 'reports', action: 'export' },

      // Dashboard
      { name: 'dashboard.index', guard_name: 'web', resource: 'dashboard', action: 'index' },

      // Notificaciones
      { name: 'notification.index', guard_name: 'web', resource: 'notifications', action: 'index' },
      { name: 'notification.create', guard_name: 'web', resource: 'notifications', action: 'create' },
      { name: 'notification.edit', guard_name: 'web', resource: 'notifications', action: 'edit' },
      { name: 'notification.destroy', guard_name: 'web', resource: 'notifications', action: 'destroy' },

      // Medios
      { name: 'media.index', guard_name: 'web', resource: 'media', action: 'index' },
      { name: 'media.create', guard_name: 'web', resource: 'media', action: 'create' },
      { name: 'media.edit', guard_name: 'web', resource: 'media', action: 'edit' },
      { name: 'media.destroy', guard_name: 'web', resource: 'media', action: 'destroy' },

      // Impuestos
      { name: 'tax.index', guard_name: 'web', resource: 'taxes', action: 'index' },
      { name: 'tax.create', guard_name: 'web', resource: 'taxes', action: 'create' },
      { name: 'tax.edit', guard_name: 'web', resource: 'taxes', action: 'edit' },
      { name: 'tax.destroy', guard_name: 'web', resource: 'taxes', action: 'destroy' },

      // Envíos
      { name: 'shipping.index', guard_name: 'web', resource: 'shipping', action: 'index' },
      { name: 'shipping.create', guard_name: 'web', resource: 'shipping', action: 'create' },
      { name: 'shipping.edit', guard_name: 'web', resource: 'shipping', action: 'edit' },
      { name: 'shipping.destroy', guard_name: 'web', resource: 'shipping', action: 'destroy' },

      // Monedas
      { name: 'currency.index', guard_name: 'web', resource: 'currencies', action: 'index' },
      { name: 'currency.create', guard_name: 'web', resource: 'currencies', action: 'create' },
      { name: 'currency.edit', guard_name: 'web', resource: 'currencies', action: 'edit' },
      { name: 'currency.destroy', guard_name: 'web', resource: 'currencies', action: 'destroy' },

      // Etiquetas
      { name: 'tag.index', guard_name: 'web', resource: 'tags', action: 'index' },
      { name: 'tag.create', guard_name: 'web', resource: 'tags', action: 'create' },
      { name: 'tag.edit', guard_name: 'web', resource: 'tags', action: 'edit' },
      { name: 'tag.destroy', guard_name: 'web', resource: 'tags', action: 'destroy' },

      // Atributos
      { name: 'attribute.index', guard_name: 'web', resource: 'attributes', action: 'index' },
      { name: 'attribute.create', guard_name: 'web', resource: 'attributes', action: 'create' },
      { name: 'attribute.edit', guard_name: 'web', resource: 'attributes', action: 'edit' },
      { name: 'attribute.destroy', guard_name: 'web', resource: 'attributes', action: 'destroy' },

      // Preguntas y Respuestas
      { name: 'qna.index', guard_name: 'web', resource: 'qna', action: 'index' },
      { name: 'qna.create', guard_name: 'web', resource: 'qna', action: 'create' },
      { name: 'qna.edit', guard_name: 'web', resource: 'qna', action: 'edit' },
      { name: 'qna.destroy', guard_name: 'web', resource: 'qna', action: 'destroy' },

      // Claves de Licencia
      { name: 'license-key.index', guard_name: 'web', resource: 'license-keys', action: 'index' },
      { name: 'license-key.create', guard_name: 'web', resource: 'license-keys', action: 'create' },
      { name: 'license-key.edit', guard_name: 'web', resource: 'license-keys', action: 'edit' },
      { name: 'license-key.destroy', guard_name: 'web', resource: 'license-keys', action: 'destroy' },

      // Billeteras
      { name: 'wallet.index', guard_name: 'web', resource: 'wallets', action: 'index' },
      { name: 'wallet.create', guard_name: 'web', resource: 'wallets', action: 'create' },
      { name: 'wallet.edit', guard_name: 'web', resource: 'wallets', action: 'edit' },
      { name: 'wallet.destroy', guard_name: 'web', resource: 'wallets', action: 'destroy' },

      // Comisiones
      { name: 'commission.index', guard_name: 'web', resource: 'commissions', action: 'index' },
      { name: 'commission.create', guard_name: 'web', resource: 'commissions', action: 'create' },
      { name: 'commission.edit', guard_name: 'web', resource: 'commissions', action: 'edit' },
      { name: 'commission.destroy', guard_name: 'web', resource: 'commissions', action: 'destroy' },

      // Retiros
      { name: 'withdrawal.index', guard_name: 'web', resource: 'withdrawals', action: 'index' },
      { name: 'withdrawal.create', guard_name: 'web', resource: 'withdrawals', action: 'create' },
      { name: 'withdrawal.edit', guard_name: 'web', resource: 'withdrawals', action: 'edit' },
      { name: 'withdrawal.destroy', guard_name: 'web', resource: 'withdrawals', action: 'destroy' },

      // Detalles de Pago
      { name: 'payment-details.index', guard_name: 'web', resource: 'payment-details', action: 'index' },
      { name: 'payment-details.create', guard_name: 'web', resource: 'payment-details', action: 'create' },
      { name: 'payment-details.edit', guard_name: 'web', resource: 'payment-details', action: 'edit' },
      { name: 'payment-details.destroy', guard_name: 'web', resource: 'payment-details', action: 'destroy' },

      // Billeteras de Vendedor
      { name: 'vendor-wallet.index', guard_name: 'web', resource: 'vendor-wallets', action: 'index' },
      { name: 'vendor-wallet.create', guard_name: 'web', resource: 'vendor-wallets', action: 'create' },
      { name: 'vendor-wallet.edit', guard_name: 'web', resource: 'vendor-wallets', action: 'edit' },
      { name: 'vendor-wallet.destroy', guard_name: 'web', resource: 'vendor-wallets', action: 'destroy' },

      // Reembolsos
      { name: 'refund.index', guard_name: 'web', resource: 'refunds', action: 'index' },
      { name: 'refund.create', guard_name: 'web', resource: 'refunds', action: 'create' },
      { name: 'refund.edit', guard_name: 'web', resource: 'refunds', action: 'edit' },
      { name: 'refund.destroy', guard_name: 'web', resource: 'refunds', action: 'destroy' },

      // Reseñas
      { name: 'review.index', guard_name: 'web', resource: 'reviews', action: 'index' },
      { name: 'review.create', guard_name: 'web', resource: 'reviews', action: 'create' },
      { name: 'review.edit', guard_name: 'web', resource: 'reviews', action: 'edit' },
      { name: 'review.destroy', guard_name: 'web', resource: 'reviews', action: 'destroy' },

      // Avisos
      { name: 'notice.index', guard_name: 'web', resource: 'notices', action: 'index' },
      { name: 'notice.create', guard_name: 'web', resource: 'notices', action: 'create' },
      { name: 'notice.edit', guard_name: 'web', resource: 'notices', action: 'edit' },
      { name: 'notice.destroy', guard_name: 'web', resource: 'notices', action: 'destroy' },

      // Suscripciones
      { name: 'subscription.index', guard_name: 'web', resource: 'subscriptions', action: 'index' },
      { name: 'subscription.create', guard_name: 'web', resource: 'subscriptions', action: 'create' },
      { name: 'subscription.edit', guard_name: 'web', resource: 'subscriptions', action: 'edit' },
      { name: 'subscription.destroy', guard_name: 'web', resource: 'subscriptions', action: 'destroy' },

      // Opciones de Tema
      { name: 'theme-option.index', guard_name: 'web', resource: 'theme-options', action: 'index' },
      { name: 'theme-option.create', guard_name: 'web', resource: 'theme-options', action: 'create' },
      { name: 'theme-option.edit', guard_name: 'web', resource: 'theme-options', action: 'edit' },
      { name: 'theme-option.destroy', guard_name: 'web', resource: 'theme-options', action: 'destroy' },

      // Menús
      { name: 'menu.index', guard_name: 'web', resource: 'menus', action: 'index' },
      { name: 'menu.create', guard_name: 'web', resource: 'menus', action: 'create' },
      { name: 'menu.edit', guard_name: 'web', resource: 'menus', action: 'edit' },
      { name: 'menu.destroy', guard_name: 'web', resource: 'menus', action: 'destroy' },

      // Puntos
      { name: 'point.index', guard_name: 'web', resource: 'points', action: 'index' },
      { name: 'point.create', guard_name: 'web', resource: 'points', action: 'create' },
      { name: 'point.edit', guard_name: 'web', resource: 'points', action: 'edit' },
      { name: 'point.destroy', guard_name: 'web', resource: 'points', action: 'destroy' }
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
        console.log(`   ⏭️ Permiso ya existe: ${(existingPermission as any).name}`);
      }
    }

    // 3. Asignar TODOS los permisos al rol Super Administrador
    console.log('🔄 Asignando permisos al rol Super Administrador...');
    (superAdminRole as any).permissions = createdPermissions.map((p: any) => p._id);
    await (superAdminRole as any).save();

    // Actualizar las relaciones en la tabla pivot
    await RolePermissionModel.deleteMany({ role_id: (superAdminRole as any).id });
    
    const rolePermissions = createdPermissions.map((permission: any) => ({
      role_id: (superAdminRole as any).id,
      permission_id: permission.id
    }));

    await RolePermissionModel.insertMany(rolePermissions);
    console.log(`   ✅ ${rolePermissions.length} permisos asignados al rol Super Administrador`);

    // 4. Crear usuario Super Administrador
    console.log('🔄 Creando usuario Super Administrador...');
    const existingSuperAdmin = await UserModel.findOne({ email: 'admin@borboleta.com' });
    
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      const superAdminData = {
        name: 'Super Administrador',
        email: 'admin@borboleta.com',
        password: hashedPassword,
        phone: '1234567890',
        country_code: 1,
        role_id: (superAdminRole as any).id,
        status: true,
        is_approved: true
      };

      const superAdmin = new UserModel(superAdminData);
      await (superAdmin as any).save();

      console.log('🎉 Usuario Super Administrador creado exitosamente!');
      console.log('📋 Detalles del usuario:');
      console.log(`   ID: ${(superAdmin as any).id}`);
      console.log(`   Nombre: ${(superAdmin as any).name}`);
      console.log(`   Email: ${(superAdmin as any).email}`);
      console.log(`   Password: admin123456`);
      console.log(`   Rol: Super Administrador`);
      console.log(`   Permisos: ${rolePermissions.length}`);

      console.log('\n🔐 Credenciales de acceso:');
      console.log('   Email: admin@borboleta.com');
      console.log('   Password: admin123456');
      console.log('\n📡 Endpoint de login:');
      console.log('   POST http://localhost:3001/api/users/login');
    } else {
      console.log('⚠️  El usuario Super Administrador ya existe');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   ID: ${existingSuperAdmin.id}`);
    }

    console.log('\n🎉 Sistema inicializado completamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Rol: Super Administrador`);
    console.log(`   - Permisos: ${createdPermissions.length}`);
    console.log(`   - Usuario: admin@borboleta.com`);

  } catch (error) {
    console.error('❌ Error al inicializar el sistema:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
initCompleteSystem();

