import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function addAllPermissions() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Todos los permisos del sistema
    const permissions = [
      // Gestión de Usuarios
      { name: 'users.create', guard_name: 'web', resource: 'users', action: 'create' },
      { name: 'users.read', guard_name: 'web', resource: 'users', action: 'read' },
      { name: 'users.update', guard_name: 'web', resource: 'users', action: 'update' },
      { name: 'users.delete', guard_name: 'web', resource: 'users', action: 'delete' },
      { name: 'users.manage', guard_name: 'web', resource: 'users', action: 'manage' },
      
      // Gestión de Roles y Permisos
      { name: 'roles.create', guard_name: 'web', resource: 'roles', action: 'create' },
      { name: 'roles.read', guard_name: 'web', resource: 'roles', action: 'read' },
      { name: 'roles.update', guard_name: 'web', resource: 'roles', action: 'update' },
      { name: 'roles.delete', guard_name: 'web', resource: 'roles', action: 'delete' },
      { name: 'permissions.manage', guard_name: 'web', resource: 'permissions', action: 'manage' },
      
      // Gestión de Productos
      { name: 'products.create', guard_name: 'web', resource: 'products', action: 'create' },
      { name: 'products.read', guard_name: 'web', resource: 'products', action: 'read' },
      { name: 'products.update', guard_name: 'web', resource: 'products', action: 'update' },
      { name: 'products.delete', guard_name: 'web', resource: 'products', action: 'delete' },
      { name: 'products.manage', guard_name: 'web', resource: 'products', action: 'manage' },
      
      // Gestión de Categorías
      { name: 'categories.create', guard_name: 'web', resource: 'categories', action: 'create' },
      { name: 'categories.read', guard_name: 'web', resource: 'categories', action: 'read' },
      { name: 'categories.update', guard_name: 'web', resource: 'categories', action: 'update' },
      { name: 'categories.delete', guard_name: 'web', resource: 'categories', action: 'delete' },
      { name: 'categories.manage', guard_name: 'web', resource: 'categories', action: 'manage' },
      
      // Gestión de Marcas
      { name: 'brands.create', guard_name: 'web', resource: 'brands', action: 'create' },
      { name: 'brands.read', guard_name: 'web', resource: 'brands', action: 'read' },
      { name: 'brands.update', guard_name: 'web', resource: 'brands', action: 'update' },
      { name: 'brands.delete', guard_name: 'web', resource: 'brands', action: 'delete' },
      { name: 'brands.manage', guard_name: 'web', resource: 'brands', action: 'manage' },
      
      // Gestión de Pedidos
      { name: 'orders.create', guard_name: 'web', resource: 'orders', action: 'create' },
      { name: 'orders.read', guard_name: 'web', resource: 'orders', action: 'read' },
      { name: 'orders.update', guard_name: 'web', resource: 'orders', action: 'update' },
      { name: 'orders.delete', guard_name: 'web', resource: 'orders', action: 'delete' },
      { name: 'orders.manage', guard_name: 'web', resource: 'orders', action: 'manage' },
      
      // Gestión de Tiendas
      { name: 'stores.create', guard_name: 'web', resource: 'stores', action: 'create' },
      { name: 'stores.read', guard_name: 'web', resource: 'stores', action: 'read' },
      { name: 'stores.update', guard_name: 'web', resource: 'stores', action: 'update' },
      { name: 'stores.delete', guard_name: 'web', resource: 'stores', action: 'delete' },
      { name: 'stores.manage', guard_name: 'web', resource: 'stores', action: 'manage' },
      
      // Gestión de Envíos
      { name: 'shipping.create', guard_name: 'web', resource: 'shipping', action: 'create' },
      { name: 'shipping.read', guard_name: 'web', resource: 'shipping', action: 'read' },
      { name: 'shipping.update', guard_name: 'web', resource: 'shipping', action: 'update' },
      { name: 'shipping.delete', guard_name: 'web', resource: 'shipping', action: 'delete' },
      { name: 'shipping.manage', guard_name: 'web', resource: 'shipping', action: 'manage' },
      
      // Gestión de Impuestos
      { name: 'taxes.create', guard_name: 'web', resource: 'taxes', action: 'create' },
      { name: 'taxes.read', guard_name: 'web', resource: 'taxes', action: 'read' },
      { name: 'taxes.update', guard_name: 'web', resource: 'taxes', action: 'update' },
      { name: 'taxes.delete', guard_name: 'web', resource: 'taxes', action: 'delete' },
      { name: 'taxes.manage', guard_name: 'web', resource: 'taxes', action: 'manage' },
      
      // Gestión de Cupones
      { name: 'coupons.create', guard_name: 'web', resource: 'coupons', action: 'create' },
      { name: 'coupons.read', guard_name: 'web', resource: 'coupons', action: 'read' },
      { name: 'coupons.update', guard_name: 'web', resource: 'coupons', action: 'update' },
      { name: 'coupons.delete', guard_name: 'web', resource: 'coupons', action: 'delete' },
      { name: 'coupons.manage', guard_name: 'web', resource: 'coupons', action: 'manage' },
      
      // Gestión de Blogs
      { name: 'blogs.create', guard_name: 'web', resource: 'blogs', action: 'create' },
      { name: 'blogs.read', guard_name: 'web', resource: 'blogs', action: 'read' },
      { name: 'blogs.update', guard_name: 'web', resource: 'blogs', action: 'update' },
      { name: 'blogs.delete', guard_name: 'web', resource: 'blogs', action: 'delete' },
      { name: 'blogs.manage', guard_name: 'web', resource: 'blogs', action: 'manage' },
      
      // Gestión de Páginas
      { name: 'pages.create', guard_name: 'web', resource: 'pages', action: 'create' },
      { name: 'pages.read', guard_name: 'web', resource: 'pages', action: 'read' },
      { name: 'pages.update', guard_name: 'web', resource: 'pages', action: 'update' },
      { name: 'pages.delete', guard_name: 'web', resource: 'pages', action: 'delete' },
      { name: 'pages.manage', guard_name: 'web', resource: 'pages', action: 'manage' },
      
      // Gestión de FAQs
      { name: 'faqs.create', guard_name: 'web', resource: 'faqs', action: 'create' },
      { name: 'faqs.read', guard_name: 'web', resource: 'faqs', action: 'read' },
      { name: 'faqs.update', guard_name: 'web', resource: 'faqs', action: 'update' },
      { name: 'faqs.delete', guard_name: 'web', resource: 'faqs', action: 'delete' },
      { name: 'faqs.manage', guard_name: 'web', resource: 'faqs', action: 'manage' },
      
      // Gestión de Temas
      { name: 'themes.create', guard_name: 'web', resource: 'themes', action: 'create' },
      { name: 'themes.read', guard_name: 'web', resource: 'themes', action: 'read' },
      { name: 'themes.update', guard_name: 'web', resource: 'themes', action: 'update' },
      { name: 'themes.delete', guard_name: 'web', resource: 'themes', action: 'delete' },
      { name: 'themes.manage', guard_name: 'web', resource: 'themes', action: 'manage' },
      
      // Configuraciones del Sistema
      { name: 'settings.read', guard_name: 'web', resource: 'settings', action: 'read' },
      { name: 'settings.update', guard_name: 'web', resource: 'settings', action: 'update' },
      { name: 'settings.manage', guard_name: 'web', resource: 'settings', action: 'manage' },
      
      // Reportes y Analytics
      { name: 'reports.read', guard_name: 'web', resource: 'reports', action: 'read' },
      { name: 'reports.export', guard_name: 'web', resource: 'reports', action: 'export' },
      { name: 'reports.manage', guard_name: 'web', resource: 'reports', action: 'manage' },
      
      // Dashboard
      { name: 'dashboard.read', guard_name: 'web', resource: 'dashboard', action: 'read' },
      { name: 'dashboard.manage', guard_name: 'web', resource: 'dashboard', action: 'manage' },
      
      // Notificaciones
      { name: 'notifications.read', guard_name: 'web', resource: 'notifications', action: 'read' },
      { name: 'notifications.manage', guard_name: 'web', resource: 'notifications', action: 'manage' },
      
      // Gestión de Pagos
      { name: 'payments.read', guard_name: 'web', resource: 'payments', action: 'read' },
      { name: 'payments.manage', guard_name: 'web', resource: 'payments', action: 'manage' },
      
      // Gestión de Comisiones
      { name: 'commissions.read', guard_name: 'web', resource: 'commissions', action: 'read' },
      { name: 'commissions.manage', guard_name: 'web', resource: 'commissions', action: 'manage' },
      
      // Gestión de Billeteras
      { name: 'wallets.read', guard_name: 'web', resource: 'wallets', action: 'read' },
      { name: 'wallets.manage', guard_name: 'web', resource: 'wallets', action: 'manage' },
      
      // Gestión de Retiros
      { name: 'withdrawals.read', guard_name: 'web', resource: 'withdrawals', action: 'read' },
      { name: 'withdrawals.manage', guard_name: 'web', resource: 'withdrawals', action: 'manage' },
      
      // Gestión de Reembolsos
      { name: 'refunds.read', guard_name: 'web', resource: 'refunds', action: 'read' },
      { name: 'refunds.manage', guard_name: 'web', resource: 'refunds', action: 'manage' },
      
      // Gestión de Preguntas y Respuestas
      { name: 'questions.read', guard_name: 'web', resource: 'questions', action: 'read' },
      { name: 'questions.manage', guard_name: 'web', resource: 'questions', action: 'manage' },
      
      // Gestión de Reseñas
      { name: 'reviews.read', guard_name: 'web', resource: 'reviews', action: 'read' },
      { name: 'reviews.manage', guard_name: 'web', resource: 'reviews', action: 'manage' },
      
      // Gestión de Puntos
      { name: 'points.read', guard_name: 'web', resource: 'points', action: 'read' },
      { name: 'points.manage', guard_name: 'web', resource: 'points', action: 'manage' },
      
      // Gestión de Licencias
      { name: 'licenses.read', guard_name: 'web', resource: 'licenses', action: 'read' },
      { name: 'licenses.manage', guard_name: 'web', resource: 'licenses', action: 'manage' },
      
      // Gestión de Medios
      { name: 'media.read', guard_name: 'web', resource: 'media', action: 'read' },
      { name: 'media.manage', guard_name: 'web', resource: 'media', action: 'manage' },
      
      // Gestión de Menús
      { name: 'menus.read', guard_name: 'web', resource: 'menus', action: 'read' },
      { name: 'menus.manage', guard_name: 'web', resource: 'menus', action: 'manage' },
      
      // Gestión de Avisos
      { name: 'notices.read', guard_name: 'web', resource: 'notices', action: 'read' },
      { name: 'notices.manage', guard_name: 'web', resource: 'notices', action: 'manage' },
      
      // Gestión de Suscripciones
      { name: 'subscriptions.read', guard_name: 'web', resource: 'subscriptions', action: 'read' },
      { name: 'subscriptions.manage', guard_name: 'web', resource: 'subscriptions', action: 'manage' },
      
      // Gestión de Atributos
      { name: 'attributes.read', guard_name: 'web', resource: 'attributes', action: 'read' },
      { name: 'attributes.manage', guard_name: 'web', resource: 'attributes', action: 'manage' },
      
      // Gestión de Etiquetas
      { name: 'tags.read', guard_name: 'web', resource: 'tags', action: 'read' },
      { name: 'tags.manage', guard_name: 'web', resource: 'tags', action: 'manage' },
      
      // Gestión de Monedas
      { name: 'currencies.read', guard_name: 'web', resource: 'currencies', action: 'read' },
      { name: 'currencies.manage', guard_name: 'web', resource: 'currencies', action: 'manage' },
      
      // Gestión de Países
      { name: 'countries.read', guard_name: 'web', resource: 'countries', action: 'read' },
      { name: 'countries.manage', guard_name: 'web', resource: 'countries', action: 'manage' },
      
      // Gestión de Estados
      { name: 'states.read', guard_name: 'web', resource: 'states', action: 'read' },
      { name: 'states.manage', guard_name: 'web', resource: 'states', action: 'manage' },
      
      // Gestión de Ciudades
      { name: 'cities.read', guard_name: 'web', resource: 'cities', action: 'read' },
      { name: 'cities.manage', guard_name: 'web', resource: 'cities', action: 'manage' },
      
      // Gestión de Atributos de Productos
      { name: 'product-attributes.read', guard_name: 'web', resource: 'product-attributes', action: 'read' },
      { name: 'product-attributes.manage', guard_name: 'web', resource: 'product-attributes', action: 'manage' },
      
      // Gestión de Variantes de Productos
      { name: 'product-variants.read', guard_name: 'web', resource: 'product-variants', action: 'read' },
      { name: 'product-variants.manage', guard_name: 'web', resource: 'product-variants', action: 'manage' },
      
      // Gestión de Inventario
      { name: 'inventory.read', guard_name: 'web', resource: 'inventory', action: 'read' },
      { name: 'inventory.manage', guard_name: 'web', resource: 'inventory', action: 'manage' },
      
      // Gestión de Descuentos
      { name: 'discounts.read', guard_name: 'web', resource: 'discounts', action: 'read' },
      { name: 'discounts.manage', guard_name: 'web', resource: 'discounts', action: 'manage' },
      
      // Gestión de Promociones
      { name: 'promotions.read', guard_name: 'web', resource: 'promotions', action: 'read' },
      { name: 'promotions.manage', guard_name: 'web', resource: 'promotions', action: 'manage' },
      
      // Gestión de Códigos de Descuento
      { name: 'discount-codes.read', guard_name: 'web', resource: 'discount-codes', action: 'read' },
      { name: 'discount-codes.manage', guard_name: 'web', resource: 'discount-codes', action: 'manage' },
      
      // Gestión de Códigos de Promoción
      { name: 'promotion-codes.read', guard_name: 'web', resource: 'promotion-codes', action: 'read' },
      { name: 'promotion-codes.manage', guard_name: 'web', resource: 'promotion-codes', action: 'manage' },
      
      // Gestión de Códigos de Cupón
      { name: 'coupon-codes.read', guard_name: 'web', resource: 'coupon-codes', action: 'read' },
      { name: 'coupon-codes.manage', guard_name: 'web', resource: 'coupon-codes', action: 'manage' },
      
      // Gestión de Códigos de Descuento Especiales
      { name: 'special-discounts.read', guard_name: 'web', resource: 'special-discounts', action: 'read' },
      { name: 'special-discounts.manage', guard_name: 'web', resource: 'special-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción Especiales
      { name: 'special-promotions.read', guard_name: 'web', resource: 'special-promotions', action: 'read' },
      { name: 'special-promotions.manage', guard_name: 'web', resource: 'special-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón Especiales
      { name: 'special-coupons.read', guard_name: 'web', resource: 'special-coupons', action: 'read' },
      { name: 'special-coupons.manage', guard_name: 'web', resource: 'special-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Usuario
      { name: 'user-discounts.read', guard_name: 'web', resource: 'user-discounts', action: 'read' },
      { name: 'user-discounts.manage', guard_name: 'web', resource: 'user-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Usuario
      { name: 'user-promotions.read', guard_name: 'web', resource: 'user-promotions', action: 'read' },
      { name: 'user-promotions.manage', guard_name: 'web', resource: 'user-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Usuario
      { name: 'user-coupons.read', guard_name: 'web', resource: 'user-coupons', action: 'read' },
      { name: 'user-coupons.manage', guard_name: 'web', resource: 'user-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Producto
      { name: 'product-discounts.read', guard_name: 'web', resource: 'product-discounts', action: 'read' },
      { name: 'product-discounts.manage', guard_name: 'web', resource: 'product-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Producto
      { name: 'product-promotions.read', guard_name: 'web', resource: 'product-promotions', action: 'read' },
      { name: 'product-promotions.manage', guard_name: 'web', resource: 'product-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Producto
      { name: 'product-coupons.read', guard_name: 'web', resource: 'product-coupons', action: 'read' },
      { name: 'product-coupons.manage', guard_name: 'web', resource: 'product-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Categoría
      { name: 'category-discounts.read', guard_name: 'web', resource: 'category-discounts', action: 'read' },
      { name: 'category-discounts.manage', guard_name: 'web', resource: 'category-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Categoría
      { name: 'category-promotions.read', guard_name: 'web', resource: 'category-promotions', action: 'read' },
      { name: 'category-promotions.manage', guard_name: 'web', resource: 'category-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Categoría
      { name: 'category-coupons.read', guard_name: 'web', resource: 'category-coupons', action: 'read' },
      { name: 'category-coupons.manage', guard_name: 'web', resource: 'category-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Marca
      { name: 'brand-discounts.read', guard_name: 'web', resource: 'brand-discounts', action: 'read' },
      { name: 'brand-discounts.manage', guard_name: 'web', resource: 'brand-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Marca
      { name: 'brand-promotions.read', guard_name: 'web', resource: 'brand-promotions', action: 'read' },
      { name: 'brand-promotions.manage', guard_name: 'web', resource: 'brand-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Marca
      { name: 'brand-coupons.read', guard_name: 'web', resource: 'brand-coupons', action: 'read' },
      { name: 'brand-coupons.manage', guard_name: 'web', resource: 'brand-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Tienda
      { name: 'store-discounts.read', guard_name: 'web', resource: 'store-discounts', action: 'read' },
      { name: 'store-discounts.manage', guard_name: 'web', resource: 'store-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Tienda
      { name: 'store-promotions.read', guard_name: 'web', resource: 'store-promotions', action: 'read' },
      { name: 'store-promotions.manage', guard_name: 'web', resource: 'store-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Tienda
      { name: 'store-coupons.read', guard_name: 'web', resource: 'store-coupons', action: 'read' },
      { name: 'store-coupons.manage', guard_name: 'web', resource: 'store-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Usuario y Producto
      { name: 'user-product-discounts.read', guard_name: 'web', resource: 'user-product-discounts', action: 'read' },
      { name: 'user-product-discounts.manage', guard_name: 'web', resource: 'user-product-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Usuario y Producto
      { name: 'user-product-promotions.read', guard_name: 'web', resource: 'user-product-promotions', action: 'read' },
      { name: 'user-product-promotions.manage', guard_name: 'web', resource: 'user-product-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Usuario y Producto
      { name: 'user-product-coupons.read', guard_name: 'web', resource: 'user-product-coupons', action: 'read' },
      { name: 'user-product-coupons.manage', guard_name: 'web', resource: 'user-product-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Usuario y Categoría
      { name: 'user-category-discounts.read', guard_name: 'web', resource: 'user-category-discounts', action: 'read' },
      { name: 'user-category-discounts.manage', guard_name: 'web', resource: 'user-category-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Usuario y Categoría
      { name: 'user-category-promotions.read', guard_name: 'web', resource: 'user-category-promotions', action: 'read' },
      { name: 'user-category-promotions.manage', guard_name: 'web', resource: 'user-category-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Usuario y Categoría
      { name: 'user-category-coupons.read', guard_name: 'web', resource: 'user-category-coupons', action: 'read' },
      { name: 'user-category-coupons.manage', guard_name: 'web', resource: 'user-category-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Usuario y Marca
      { name: 'user-brand-discounts.read', guard_name: 'web', resource: 'user-brand-discounts', action: 'read' },
      { name: 'user-brand-discounts.manage', guard_name: 'web', resource: 'user-brand-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Usuario y Marca
      { name: 'user-brand-promotions.read', guard_name: 'web', resource: 'user-brand-promotions', action: 'read' },
      { name: 'user-brand-promotions.manage', guard_name: 'web', resource: 'user-brand-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Usuario y Marca
      { name: 'user-brand-coupons.read', guard_name: 'web', resource: 'user-brand-coupons', action: 'read' },
      { name: 'user-brand-coupons.manage', guard_name: 'web', resource: 'user-brand-coupons', action: 'manage' },
      
      // Gestión de Códigos de Descuento por Usuario y Tienda
      { name: 'user-store-discounts.read', guard_name: 'web', resource: 'user-store-discounts', action: 'read' },
      { name: 'user-store-discounts.manage', guard_name: 'web', resource: 'user-store-discounts', action: 'manage' },
      
      // Gestión de Códigos de Promoción por Usuario y Tienda
      { name: 'user-store-promotions.read', guard_name: 'web', resource: 'user-store-promotions', action: 'read' },
      { name: 'user-store-promotions.manage', guard_name: 'web', resource: 'user-store-promotions', action: 'manage' },
      
      // Gestión de Códigos de Cupón por Usuario y Tienda
      { name: 'user-store-coupons.read', guard_name: 'web', resource: 'user-store-coupons', action: 'read' },
      { name: 'user-store-coupons.manage', guard_name: 'web', resource: 'user-store-coupons', action: 'manage' }
    ];

    console.log(`🔄 Creando ${permissions.length} permisos...`);

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

    // Buscar el rol de admin
    const adminRole = await RoleModel.findOne({ name: 'admin' });
    if (adminRole) {
      // Actualizar el rol con todos los permisos
      (adminRole as any).permissions = createdPermissions.map((p: any) => p._id);
      await (adminRole as any).save();

      // Actualizar las relaciones en la tabla pivot
      await RolePermissionModel.deleteMany({ role_id: (adminRole as any).id });
      
      const rolePermissions = createdPermissions.map((permission: any) => ({
        role_id: (adminRole as any).id,
        permission_id: permission.id
      }));

      await RolePermissionModel.insertMany(rolePermissions);
      console.log(`✅ Rol de administrador actualizado con ${rolePermissions.length} permisos`);
    }

    console.log('🎉 Todos los permisos han sido creados y asignados al rol de administrador!');

  } catch (error) {
    console.error('❌ Error al crear permisos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
addAllPermissions();
