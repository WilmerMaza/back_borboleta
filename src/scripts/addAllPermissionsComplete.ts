import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import connectDB from '../infrastructure/database/config/database';

async function addAllPermissionsComplete() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Lista completa de todos los permisos solicitados
    const allPermissions = [
      // Usuarios
      { name: 'users.create', guard_name: 'web', resource: 'users', action: 'create', description: 'Crear usuarios' },
      { name: 'users.read', guard_name: 'web', resource: 'users', action: 'read', description: 'Ver lista de usuarios' },
      { name: 'users.update', guard_name: 'web', resource: 'users', action: 'update', description: 'Editar usuarios' },
      { name: 'users.delete', guard_name: 'web', resource: 'users', action: 'delete', description: 'Eliminar usuarios' },
      { name: 'users.manage', guard_name: 'web', resource: 'users', action: 'manage', description: 'Gestión completa de usuarios' },
      
      // Roles y Permisos
      { name: 'roles.create', guard_name: 'web', resource: 'roles', action: 'create', description: 'Crear roles' },
      { name: 'roles.read', guard_name: 'web', resource: 'roles', action: 'read', description: 'Ver roles' },
      { name: 'roles.update', guard_name: 'web', resource: 'roles', action: 'update', description: 'Editar roles' },
      { name: 'roles.delete', guard_name: 'web', resource: 'roles', action: 'delete', description: 'Eliminar roles' },
      { name: 'permissions.manage', guard_name: 'web', resource: 'permissions', action: 'manage', description: 'Gestionar permisos' },
      
      // Productos
      { name: 'products.create', guard_name: 'web', resource: 'products', action: 'create', description: 'Crear productos' },
      { name: 'products.read', guard_name: 'web', resource: 'products', action: 'read', description: 'Ver productos' },
      { name: 'products.update', guard_name: 'web', resource: 'products', action: 'update', description: 'Editar productos' },
      { name: 'products.delete', guard_name: 'web', resource: 'products', action: 'delete', description: 'Eliminar productos' },
      { name: 'products.manage', guard_name: 'web', resource: 'products', action: 'manage', description: 'Gestión completa de productos' },
      
      // Categorías
      { name: 'categories.create', guard_name: 'web', resource: 'categories', action: 'create', description: 'Crear categorías' },
      { name: 'categories.read', guard_name: 'web', resource: 'categories', action: 'read', description: 'Ver categorías' },
      { name: 'categories.update', guard_name: 'web', resource: 'categories', action: 'update', description: 'Editar categorías' },
      { name: 'categories.delete', guard_name: 'web', resource: 'categories', action: 'delete', description: 'Eliminar categorías' },
      { name: 'categories.manage', guard_name: 'web', resource: 'categories', action: 'manage', description: 'Gestión completa de categorías' },
      
      // Marcas
      { name: 'brands.create', guard_name: 'web', resource: 'brands', action: 'create', description: 'Crear marcas' },
      { name: 'brands.read', guard_name: 'web', resource: 'brands', action: 'read', description: 'Ver marcas' },
      { name: 'brands.update', guard_name: 'web', resource: 'brands', action: 'update', description: 'Editar marcas' },
      { name: 'brands.delete', guard_name: 'web', resource: 'brands', action: 'delete', description: 'Eliminar marcas' },
      { name: 'brands.manage', guard_name: 'web', resource: 'brands', action: 'manage', description: 'Gestión completa de marcas' },
      
      // Pedidos
      { name: 'orders.create', guard_name: 'web', resource: 'orders', action: 'create', description: 'Crear pedidos' },
      { name: 'orders.read', guard_name: 'web', resource: 'orders', action: 'read', description: 'Ver pedidos' },
      { name: 'orders.update', guard_name: 'web', resource: 'orders', action: 'update', description: 'Editar pedidos' },
      { name: 'orders.delete', guard_name: 'web', resource: 'orders', action: 'delete', description: 'Eliminar pedidos' },
      { name: 'orders.manage', guard_name: 'web', resource: 'orders', action: 'manage', description: 'Gestión completa de pedidos' },
      
      // Tiendas
      { name: 'stores.create', guard_name: 'web', resource: 'stores', action: 'create', description: 'Crear tiendas' },
      { name: 'stores.read', guard_name: 'web', resource: 'stores', action: 'read', description: 'Ver tiendas' },
      { name: 'stores.update', guard_name: 'web', resource: 'stores', action: 'update', description: 'Editar tiendas' },
      { name: 'stores.delete', guard_name: 'web', resource: 'stores', action: 'delete', description: 'Eliminar tiendas' },
      { name: 'stores.manage', guard_name: 'web', resource: 'stores', action: 'manage', description: 'Gestión completa de tiendas' },
      
      // Envíos
      { name: 'shipping.create', guard_name: 'web', resource: 'shipping', action: 'create', description: 'Crear métodos de envío' },
      { name: 'shipping.read', guard_name: 'web', resource: 'shipping', action: 'read', description: 'Ver métodos de envío' },
      { name: 'shipping.update', guard_name: 'web', resource: 'shipping', action: 'update', description: 'Editar métodos de envío' },
      { name: 'shipping.delete', guard_name: 'web', resource: 'shipping', action: 'delete', description: 'Eliminar métodos de envío' },
      { name: 'shipping.manage', guard_name: 'web', resource: 'shipping', action: 'manage', description: 'Gestión completa de envíos' },
      
      // Impuestos
      { name: 'taxes.create', guard_name: 'web', resource: 'taxes', action: 'create', description: 'Crear impuestos' },
      { name: 'taxes.read', guard_name: 'web', resource: 'taxes', action: 'read', description: 'Ver impuestos' },
      { name: 'taxes.update', guard_name: 'web', resource: 'taxes', action: 'update', description: 'Editar impuestos' },
      { name: 'taxes.delete', guard_name: 'web', resource: 'taxes', action: 'delete', description: 'Eliminar impuestos' },
      { name: 'taxes.manage', guard_name: 'web', resource: 'taxes', action: 'manage', description: 'Gestión completa de impuestos' },
      
      // Cupones
      { name: 'coupons.create', guard_name: 'web', resource: 'coupons', action: 'create', description: 'Crear cupones' },
      { name: 'coupons.read', guard_name: 'web', resource: 'coupons', action: 'read', description: 'Ver cupones' },
      { name: 'coupons.update', guard_name: 'web', resource: 'coupons', action: 'update', description: 'Editar cupones' },
      { name: 'coupons.delete', guard_name: 'web', resource: 'coupons', action: 'delete', description: 'Eliminar cupones' },
      { name: 'coupons.manage', guard_name: 'web', resource: 'coupons', action: 'manage', description: 'Gestión completa de cupones' },
      
      // Blogs
      { name: 'blogs.create', guard_name: 'web', resource: 'blogs', action: 'create', description: 'Crear blogs' },
      { name: 'blogs.read', guard_name: 'web', resource: 'blogs', action: 'read', description: 'Ver blogs' },
      { name: 'blogs.update', guard_name: 'web', resource: 'blogs', action: 'update', description: 'Editar blogs' },
      { name: 'blogs.delete', guard_name: 'web', resource: 'blogs', action: 'delete', description: 'Eliminar blogs' },
      { name: 'blogs.manage', guard_name: 'web', resource: 'blogs', action: 'manage', description: 'Gestión completa de blogs' },
      
      // Páginas
      { name: 'pages.create', guard_name: 'web', resource: 'pages', action: 'create', description: 'Crear páginas' },
      { name: 'pages.read', guard_name: 'web', resource: 'pages', action: 'read', description: 'Ver páginas' },
      { name: 'pages.update', guard_name: 'web', resource: 'pages', action: 'update', description: 'Editar páginas' },
      { name: 'pages.delete', guard_name: 'web', resource: 'pages', action: 'delete', description: 'Eliminar páginas' },
      { name: 'pages.manage', guard_name: 'web', resource: 'pages', action: 'manage', description: 'Gestión completa de páginas' },
      
      // FAQs
      { name: 'faqs.create', guard_name: 'web', resource: 'faqs', action: 'create', description: 'Crear FAQs' },
      { name: 'faqs.read', guard_name: 'web', resource: 'faqs', action: 'read', description: 'Ver FAQs' },
      { name: 'faqs.update', guard_name: 'web', resource: 'faqs', action: 'update', description: 'Editar FAQs' },
      { name: 'faqs.delete', guard_name: 'web', resource: 'faqs', action: 'delete', description: 'Eliminar FAQs' },
      { name: 'faqs.manage', guard_name: 'web', resource: 'faqs', action: 'manage', description: 'Gestión completa de FAQs' },
      
      // Temas
      { name: 'themes.create', guard_name: 'web', resource: 'themes', action: 'create', description: 'Crear temas' },
      { name: 'themes.read', guard_name: 'web', resource: 'themes', action: 'read', description: 'Ver temas' },
      { name: 'themes.update', guard_name: 'web', resource: 'themes', action: 'update', description: 'Editar temas' },
      { name: 'themes.delete', guard_name: 'web', resource: 'themes', action: 'delete', description: 'Eliminar temas' },
      { name: 'themes.manage', guard_name: 'web', resource: 'themes', action: 'manage', description: 'Gestión completa de temas' },
      
      // Configuraciones
      { name: 'settings.read', guard_name: 'web', resource: 'settings', action: 'read', description: 'Ver configuraciones' },
      { name: 'settings.update', guard_name: 'web', resource: 'settings', action: 'update', description: 'Editar configuraciones' },
      { name: 'settings.manage', guard_name: 'web', resource: 'settings', action: 'manage', description: 'Gestión completa de configuraciones' },
      
      // Reportes
      { name: 'reports.read', guard_name: 'web', resource: 'reports', action: 'read', description: 'Ver reportes' },
      { name: 'reports.export', guard_name: 'web', resource: 'reports', action: 'export', description: 'Exportar reportes' },
      { name: 'reports.manage', guard_name: 'web', resource: 'reports', action: 'manage', description: 'Gestión completa de reportes' },
      
      // Dashboard
      { name: 'dashboard.read', guard_name: 'web', resource: 'dashboard', action: 'read', description: 'Acceso al dashboard' },
      { name: 'dashboard.manage', guard_name: 'web', resource: 'dashboard', action: 'manage', description: 'Gestión completa del dashboard' },
      
      // Notificaciones
      { name: 'notifications.read', guard_name: 'web', resource: 'notifications', action: 'read', description: 'Ver notificaciones' },
      { name: 'notifications.manage', guard_name: 'web', resource: 'notifications', action: 'manage', description: 'Gestionar notificaciones' },
      
      // Pagos
      { name: 'payments.read', guard_name: 'web', resource: 'payments', action: 'read', description: 'Ver pagos' },
      { name: 'payments.manage', guard_name: 'web', resource: 'payments', action: 'manage', description: 'Gestionar pagos' },
      
      // Comisiones
      { name: 'commissions.read', guard_name: 'web', resource: 'commissions', action: 'read', description: 'Ver comisiones' },
      { name: 'commissions.manage', guard_name: 'web', resource: 'commissions', action: 'manage', description: 'Gestionar comisiones' },
      
      // Billeteras
      { name: 'wallets.read', guard_name: 'web', resource: 'wallets', action: 'read', description: 'Ver billeteras' },
      { name: 'wallets.manage', guard_name: 'web', resource: 'wallets', action: 'manage', description: 'Gestionar billeteras' },
      
      // Retiros
      { name: 'withdrawals.read', guard_name: 'web', resource: 'withdrawals', action: 'read', description: 'Ver retiros' },
      { name: 'withdrawals.manage', guard_name: 'web', resource: 'withdrawals', action: 'manage', description: 'Gestionar retiros' },
      
      // Reembolsos
      { name: 'refunds.read', guard_name: 'web', resource: 'refunds', action: 'read', description: 'Ver reembolsos' },
      { name: 'refunds.manage', guard_name: 'web', resource: 'refunds', action: 'manage', description: 'Gestionar reembolsos' },
      
      // Preguntas y Respuestas
      { name: 'questions.read', guard_name: 'web', resource: 'questions', action: 'read', description: 'Ver preguntas' },
      { name: 'questions.manage', guard_name: 'web', resource: 'questions', action: 'manage', description: 'Gestionar preguntas' },
      
      // Reseñas
      { name: 'reviews.read', guard_name: 'web', resource: 'reviews', action: 'read', description: 'Ver reseñas' },
      { name: 'reviews.manage', guard_name: 'web', resource: 'reviews', action: 'manage', description: 'Gestionar reseñas' },
      
      // Puntos
      { name: 'points.read', guard_name: 'web', resource: 'points', action: 'read', description: 'Ver puntos' },
      { name: 'points.manage', guard_name: 'web', resource: 'points', action: 'manage', description: 'Gestionar puntos' },
      
      // Licencias
      { name: 'licenses.read', guard_name: 'web', resource: 'licenses', action: 'read', description: 'Ver licencias' },
      { name: 'licenses.manage', guard_name: 'web', resource: 'licenses', action: 'manage', description: 'Gestionar licencias' },
      
      // Medios
      { name: 'media.read', guard_name: 'web', resource: 'media', action: 'read', description: 'Ver medios' },
      { name: 'media.manage', guard_name: 'web', resource: 'media', action: 'manage', description: 'Gestionar medios' },
      
      // Menús
      { name: 'menus.read', guard_name: 'web', resource: 'menus', action: 'read', description: 'Ver menús' },
      { name: 'menus.manage', guard_name: 'web', resource: 'menus', action: 'manage', description: 'Gestionar menús' },
      
      // Avisos
      { name: 'notices.read', guard_name: 'web', resource: 'notices', action: 'read', description: 'Ver avisos' },
      { name: 'notices.manage', guard_name: 'web', resource: 'notices', action: 'manage', description: 'Gestionar avisos' },
      
      // Suscripciones
      { name: 'subscriptions.read', guard_name: 'web', resource: 'subscriptions', action: 'read', description: 'Ver suscripciones' },
      { name: 'subscriptions.manage', guard_name: 'web', resource: 'subscriptions', action: 'manage', description: 'Gestionar suscripciones' },
      
      // Atributos
      { name: 'attributes.read', guard_name: 'web', resource: 'attributes', action: 'read', description: 'Ver atributos' },
      { name: 'attributes.manage', guard_name: 'web', resource: 'attributes', action: 'manage', description: 'Gestionar atributos' },
      
      // Etiquetas
      { name: 'tags.read', guard_name: 'web', resource: 'tags', action: 'read', description: 'Ver etiquetas' },
      { name: 'tags.manage', guard_name: 'web', resource: 'tags', action: 'manage', description: 'Gestionar etiquetas' },
      
      // Monedas
      { name: 'currencies.read', guard_name: 'web', resource: 'currencies', action: 'read', description: 'Ver monedas' },
      { name: 'currencies.manage', guard_name: 'web', resource: 'currencies', action: 'manage', description: 'Gestionar monedas' },
      
      // Países
      { name: 'countries.read', guard_name: 'web', resource: 'countries', action: 'read', description: 'Ver países' },
      { name: 'countries.manage', guard_name: 'web', resource: 'countries', action: 'manage', description: 'Gestionar países' },
      
      // Estados
      { name: 'states.read', guard_name: 'web', resource: 'states', action: 'read', description: 'Ver estados' },
      { name: 'states.manage', guard_name: 'web', resource: 'states', action: 'manage', description: 'Gestionar estados' },
      
      // Ciudades
      { name: 'cities.read', guard_name: 'web', resource: 'cities', action: 'read', description: 'Ver ciudades' },
      { name: 'cities.manage', guard_name: 'web', resource: 'cities', action: 'manage', description: 'Gestionar ciudades' },
      
      // Atributos de Productos
      { name: 'product-attributes.read', guard_name: 'web', resource: 'product-attributes', action: 'read', description: 'Ver atributos de productos' },
      { name: 'product-attributes.manage', guard_name: 'web', resource: 'product-attributes', action: 'manage', description: 'Gestionar atributos de productos' },
      
      // Variantes de Productos
      { name: 'product-variants.read', guard_name: 'web', resource: 'product-variants', action: 'read', description: 'Ver variantes de productos' },
      { name: 'product-variants.manage', guard_name: 'web', resource: 'product-variants', action: 'manage', description: 'Gestionar variantes de productos' },
      
      // Inventario
      { name: 'inventory.read', guard_name: 'web', resource: 'inventory', action: 'read', description: 'Ver inventario' },
      { name: 'inventory.manage', guard_name: 'web', resource: 'inventory', action: 'manage', description: 'Gestionar inventario' },
      
      // Descuentos
      { name: 'discounts.read', guard_name: 'web', resource: 'discounts', action: 'read', description: 'Ver descuentos' },
      { name: 'discounts.manage', guard_name: 'web', resource: 'discounts', action: 'manage', description: 'Gestionar descuentos' },
      
      // Promociones
      { name: 'promotions.read', guard_name: 'web', resource: 'promotions', action: 'read', description: 'Ver promociones' },
      { name: 'promotions.manage', guard_name: 'web', resource: 'promotions', action: 'manage', description: 'Gestionar promociones' },
      
      // Códigos de Descuento
      { name: 'discount-codes.read', guard_name: 'web', resource: 'discount-codes', action: 'read', description: 'Ver códigos de descuento' },
      { name: 'discount-codes.manage', guard_name: 'web', resource: 'discount-codes', action: 'manage', description: 'Gestionar códigos de descuento' },
      
      // Códigos de Promoción
      { name: 'promotion-codes.read', guard_name: 'web', resource: 'promotion-codes', action: 'read', description: 'Ver códigos de promoción' },
      { name: 'promotion-codes.manage', guard_name: 'web', resource: 'promotion-codes', action: 'manage', description: 'Gestionar códigos de promoción' },
      
      // Códigos de Cupón
      { name: 'coupon-codes.read', guard_name: 'web', resource: 'coupon-codes', action: 'read', description: 'Ver códigos de cupón' },
      { name: 'coupon-codes.manage', guard_name: 'web', resource: 'coupon-codes', action: 'manage', description: 'Gestionar códigos de cupón' },
      
      // Descuentos Especiales
      { name: 'special-discounts.read', guard_name: 'web', resource: 'special-discounts', action: 'read', description: 'Ver descuentos especiales' },
      { name: 'special-discounts.manage', guard_name: 'web', resource: 'special-discounts', action: 'manage', description: 'Gestionar descuentos especiales' },
      
      // Promociones Especiales
      { name: 'special-promotions.read', guard_name: 'web', resource: 'special-promotions', action: 'read', description: 'Ver promociones especiales' },
      { name: 'special-promotions.manage', guard_name: 'web', resource: 'special-promotions', action: 'manage', description: 'Gestionar promociones especiales' },
      
      // Cupones Especiales
      { name: 'special-coupons.read', guard_name: 'web', resource: 'special-coupons', action: 'read', description: 'Ver cupones especiales' },
      { name: 'special-coupons.manage', guard_name: 'web', resource: 'special-coupons', action: 'manage', description: 'Gestionar cupones especiales' },
      
      // Descuentos por Usuario
      { name: 'user-discounts.read', guard_name: 'web', resource: 'user-discounts', action: 'read', description: 'Ver descuentos por usuario' },
      { name: 'user-discounts.manage', guard_name: 'web', resource: 'user-discounts', action: 'manage', description: 'Gestionar descuentos por usuario' },
      
      // Promociones por Usuario
      { name: 'user-promotions.read', guard_name: 'web', resource: 'user-promotions', action: 'read', description: 'Ver promociones por usuario' },
      { name: 'user-promotions.manage', guard_name: 'web', resource: 'user-promotions', action: 'manage', description: 'Gestionar promociones por usuario' },
      
      // Cupones por Usuario
      { name: 'user-coupons.read', guard_name: 'web', resource: 'user-coupons', action: 'read', description: 'Ver cupones por usuario' },
      { name: 'user-coupons.manage', guard_name: 'web', resource: 'user-coupons', action: 'manage', description: 'Gestionar cupones por usuario' },
      
      // Descuentos por Producto
      { name: 'product-discounts.read', guard_name: 'web', resource: 'product-discounts', action: 'read', description: 'Ver descuentos por producto' },
      { name: 'product-discounts.manage', guard_name: 'web', resource: 'product-discounts', action: 'manage', description: 'Gestionar descuentos por producto' },
      
      // Promociones por Producto
      { name: 'product-promotions.read', guard_name: 'web', resource: 'product-promotions', action: 'read', description: 'Ver promociones por producto' },
      { name: 'product-promotions.manage', guard_name: 'web', resource: 'product-promotions', action: 'manage', description: 'Gestionar promociones por producto' },
      
      // Cupones por Producto
      { name: 'product-coupons.read', guard_name: 'web', resource: 'product-coupons', action: 'read', description: 'Ver cupones por producto' },
      { name: 'product-coupons.manage', guard_name: 'web', resource: 'product-coupons', action: 'manage', description: 'Gestionar cupones por producto' },
      
      // Descuentos por Categoría
      { name: 'category-discounts.read', guard_name: 'web', resource: 'category-discounts', action: 'read', description: 'Ver descuentos por categoría' },
      { name: 'category-discounts.manage', guard_name: 'web', resource: 'category-discounts', action: 'manage', description: 'Gestionar descuentos por categoría' },
      
      // Promociones por Categoría
      { name: 'category-promotions.read', guard_name: 'web', resource: 'category-promotions', action: 'read', description: 'Ver promociones por categoría' },
      { name: 'category-promotions.manage', guard_name: 'web', resource: 'category-promotions', action: 'manage', description: 'Gestionar promociones por categoría' },
      
      // Cupones por Categoría
      { name: 'category-coupons.read', guard_name: 'web', resource: 'category-coupons', action: 'read', description: 'Ver cupones por categoría' },
      { name: 'category-coupons.manage', guard_name: 'web', resource: 'category-coupons', action: 'manage', description: 'Gestionar cupones por categoría' },
      
      // Descuentos por Marca
      { name: 'brand-discounts.read', guard_name: 'web', resource: 'brand-discounts', action: 'read', description: 'Ver descuentos por marca' },
      { name: 'brand-discounts.manage', guard_name: 'web', resource: 'brand-discounts', action: 'manage', description: 'Gestionar descuentos por marca' },
      
      // Promociones por Marca
      { name: 'brand-promotions.read', guard_name: 'web', resource: 'brand-promotions', action: 'read', description: 'Ver promociones por marca' },
      { name: 'brand-promotions.manage', guard_name: 'web', resource: 'brand-promotions', action: 'manage', description: 'Gestionar promociones por marca' },
      
      // Cupones por Marca
      { name: 'brand-coupons.read', guard_name: 'web', resource: 'brand-coupons', action: 'read', description: 'Ver cupones por marca' },
      { name: 'brand-coupons.manage', guard_name: 'web', resource: 'brand-coupons', action: 'manage', description: 'Gestionar cupones por marca' },
      
      // Descuentos por Tienda
      { name: 'store-discounts.read', guard_name: 'web', resource: 'store-discounts', action: 'read', description: 'Ver descuentos por tienda' },
      { name: 'store-discounts.manage', guard_name: 'web', resource: 'store-discounts', action: 'manage', description: 'Gestionar descuentos por tienda' },
      
      // Promociones por Tienda
      { name: 'store-promotions.read', guard_name: 'web', resource: 'store-promotions', action: 'read', description: 'Ver promociones por tienda' },
      { name: 'store-promotions.manage', guard_name: 'web', resource: 'store-promotions', action: 'manage', description: 'Gestionar promociones por tienda' },
      
      // Cupones por Tienda
      { name: 'store-coupons.read', guard_name: 'web', resource: 'store-coupons', action: 'read', description: 'Ver cupones por tienda' },
      { name: 'store-coupons.manage', guard_name: 'web', resource: 'store-coupons', action: 'manage', description: 'Gestionar cupones por tienda' },
      
      // Descuentos por Usuario y Producto
      { name: 'user-product-discounts.read', guard_name: 'web', resource: 'user-product-discounts', action: 'read', description: 'Ver descuentos por usuario y producto' },
      { name: 'user-product-discounts.manage', guard_name: 'web', resource: 'user-product-discounts', action: 'manage', description: 'Gestionar descuentos por usuario y producto' },
      
      // Promociones por Usuario y Producto
      { name: 'user-product-promotions.read', guard_name: 'web', resource: 'user-product-promotions', action: 'read', description: 'Ver promociones por usuario y producto' },
      { name: 'user-product-promotions.manage', guard_name: 'web', resource: 'user-product-promotions', action: 'manage', description: 'Gestionar promociones por usuario y producto' },
      
      // Cupones por Usuario y Producto
      { name: 'user-product-coupons.read', guard_name: 'web', resource: 'user-product-coupons', action: 'read', description: 'Ver cupones por usuario y producto' },
      { name: 'user-product-coupons.manage', guard_name: 'web', resource: 'user-product-coupons', action: 'manage', description: 'Gestionar cupones por usuario y producto' },
      
      // Descuentos por Usuario y Categoría
      { name: 'user-category-discounts.read', guard_name: 'web', resource: 'user-category-discounts', action: 'read', description: 'Ver descuentos por usuario y categoría' },
      { name: 'user-category-discounts.manage', guard_name: 'web', resource: 'user-category-discounts', action: 'manage', description: 'Gestionar descuentos por usuario y categoría' },
      
      // Promociones por Usuario y Categoría
      { name: 'user-category-promotions.read', guard_name: 'web', resource: 'user-category-promotions', action: 'read', description: 'Ver promociones por usuario y categoría' },
      { name: 'user-category-promotions.manage', guard_name: 'web', resource: 'user-category-promotions', action: 'manage', description: 'Gestionar promociones por usuario y categoría' },
      
      // Cupones por Usuario y Categoría
      { name: 'user-category-coupons.read', guard_name: 'web', resource: 'user-category-coupons', action: 'read', description: 'Ver cupones por usuario y categoría' },
      { name: 'user-category-coupons.manage', guard_name: 'web', resource: 'user-category-coupons', action: 'manage', description: 'Gestionar cupones por usuario y categoría' },
      
      // Descuentos por Usuario y Marca
      { name: 'user-brand-discounts.read', guard_name: 'web', resource: 'user-brand-discounts', action: 'read', description: 'Ver descuentos por usuario y marca' },
      { name: 'user-brand-discounts.manage', guard_name: 'web', resource: 'user-brand-discounts', action: 'manage', description: 'Gestionar descuentos por usuario y marca' },
      
      // Promociones por Usuario y Marca
      { name: 'user-brand-promotions.read', guard_name: 'web', resource: 'user-brand-promotions', action: 'read', description: 'Ver promociones por usuario y marca' },
      { name: 'user-brand-promotions.manage', guard_name: 'web', resource: 'user-brand-promotions', action: 'manage', description: 'Gestionar promociones por usuario y marca' },
      
      // Cupones por Usuario y Marca
      { name: 'user-brand-coupons.read', guard_name: 'web', resource: 'user-brand-coupons', action: 'read', description: 'Ver cupones por usuario y marca' },
      { name: 'user-brand-coupons.manage', guard_name: 'web', resource: 'user-brand-coupons', action: 'manage', description: 'Gestionar cupones por usuario y marca' },
      
      // Descuentos por Usuario y Tienda
      { name: 'user-store-discounts.read', guard_name: 'web', resource: 'user-store-discounts', action: 'read', description: 'Ver descuentos por usuario y tienda' },
      { name: 'user-store-discounts.manage', guard_name: 'web', resource: 'user-store-discounts', action: 'manage', description: 'Gestionar descuentos por usuario y tienda' },
      
      // Promociones por Usuario y Tienda
      { name: 'user-store-promotions.read', guard_name: 'web', resource: 'user-store-promotions', action: 'read', description: 'Ver promociones por usuario y tienda' },
      { name: 'user-store-promotions.manage', guard_name: 'web', resource: 'user-store-promotions', action: 'manage', description: 'Gestionar promociones por usuario y tienda' },
      
      // Cupones por Usuario y Tienda
      { name: 'user-store-coupons.read', guard_name: 'web', resource: 'user-store-coupons', action: 'read', description: 'Ver cupones por usuario y tienda' },
      { name: 'user-store-coupons.manage', guard_name: 'web', resource: 'user-store-coupons', action: 'manage', description: 'Gestionar cupones por usuario y tienda' }
    ];

    console.log(`📋 Agregando ${allPermissions.length} permisos...`);

    // Crear permisos
    const createdPermissions = [];
    for (const permissionData of allPermissions) {
      const existingPermission = await PermissionModel.findOne({ name: permissionData.name });
      if (!existingPermission) {
        const permission = new PermissionModel(permissionData);
        await (permission as any).save();
        createdPermissions.push(permission);
        console.log(`   ✅ Permiso creado: ${(permission as any).name}`);
      } else {
        createdPermissions.push(existingPermission);
        console.log(`   ⚠️  Permiso ya existe: ${(existingPermission as any).name}`);
      }
    }

    // Obtener rol admin
    const adminRole = await RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('❌ Rol admin no encontrado');
      return;
    }

    console.log(`\n🛡️ Asignando permisos al rol admin (ID: ${(adminRole as any).id})...`);

    // Eliminar permisos existentes del rol
    await RolePermissionModel.deleteMany({ role_id: (adminRole as any).id });
    console.log('   🗑️  Permisos existentes eliminados');

    // Asignar todos los permisos al rol admin
    const rolePermissions = createdPermissions.map((permission: any) => ({
      role_id: (adminRole as any).id,
      permission_id: permission.id
    }));

    await RolePermissionModel.insertMany(rolePermissions);
    console.log(`   ✅ ${rolePermissions.length} permisos asignados al rol admin`);

    // Verificar permisos asignados
    const assignedPermissions = await RolePermissionModel.find({ role_id: (adminRole as any).id });
    console.log(`\n📊 Total de permisos asignados: ${assignedPermissions.length}`);

    console.log('\n🎉 Todos los permisos han sido agregados y asignados al rol admin!');

  } catch (error) {
    console.error('❌ Error al agregar permisos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

addAllPermissionsComplete().catch(error => {
  console.error('Error en el script de permisos completos:', error);
  process.exit(1);
});

