import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import RoleModel from '../infrastructure/database/models/RoleModel';
import RolePermissionModel from '../infrastructure/database/models/RolePermissionModel';
import connectDB from '../infrastructure/database/config/database';

async function loadRealPermissions() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Limpiar permisos existentes
    console.log('🗑️ Limpiando permisos existentes...');
    await PermissionModel.deleteMany({});
    await RolePermissionModel.deleteMany({});
    console.log('   ✅ Permisos existentes eliminados');

    // Lista real de permisos del frontend (235 permisos)
    const realPermissions = [
      // Users (5 permisos)
      { name: 'user.index', guard_name: 'web', resource: 'user', action: 'index' },
      { name: 'user.create', guard_name: 'web', resource: 'user', action: 'create' },
      { name: 'user.edit', guard_name: 'web', resource: 'user', action: 'edit' },
      { name: 'user.destroy', guard_name: 'web', resource: 'user', action: 'destroy' },
      { name: 'user.show', guard_name: 'web', resource: 'user', action: 'show' },

      // Roles (5 permisos)
      { name: 'role.index', guard_name: 'web', resource: 'role', action: 'index' },
      { name: 'role.create', guard_name: 'web', resource: 'role', action: 'create' },
      { name: 'role.edit', guard_name: 'web', resource: 'role', action: 'edit' },
      { name: 'role.destroy', guard_name: 'web', resource: 'role', action: 'destroy' },
      { name: 'role.show', guard_name: 'web', resource: 'role', action: 'show' },

      // Products (5 permisos)
      { name: 'product.index', guard_name: 'web', resource: 'product', action: 'index' },
      { name: 'product.create', guard_name: 'web', resource: 'product', action: 'create' },
      { name: 'product.edit', guard_name: 'web', resource: 'product', action: 'edit' },
      { name: 'product.destroy', guard_name: 'web', resource: 'product', action: 'destroy' },
      { name: 'product.show', guard_name: 'web', resource: 'product', action: 'show' },

      // Categories (5 permisos)
      { name: 'category.index', guard_name: 'web', resource: 'category', action: 'index' },
      { name: 'category.create', guard_name: 'web', resource: 'category', action: 'create' },
      { name: 'category.edit', guard_name: 'web', resource: 'category', action: 'edit' },
      { name: 'category.destroy', guard_name: 'web', resource: 'category', action: 'destroy' },
      { name: 'category.show', guard_name: 'web', resource: 'category', action: 'show' },

      // Orders (5 permisos)
      { name: 'order.index', guard_name: 'web', resource: 'order', action: 'index' },
      { name: 'order.create', guard_name: 'web', resource: 'order', action: 'create' },
      { name: 'order.edit', guard_name: 'web', resource: 'order', action: 'edit' },
      { name: 'order.destroy', guard_name: 'web', resource: 'order', action: 'destroy' },
      { name: 'order.show', guard_name: 'web', resource: 'order', action: 'show' },

      // Settings (5 permisos)
      { name: 'setting.index', guard_name: 'web', resource: 'setting', action: 'index' },
      { name: 'setting.create', guard_name: 'web', resource: 'setting', action: 'create' },
      { name: 'setting.edit', guard_name: 'web', resource: 'setting', action: 'edit' },
      { name: 'setting.destroy', guard_name: 'web', resource: 'setting', action: 'destroy' },
      { name: 'setting.show', guard_name: 'web', resource: 'setting', action: 'show' },

      // Cart (4 permisos)
      { name: 'cart.index', guard_name: 'web', resource: 'cart', action: 'index' },
      { name: 'cart.create', guard_name: 'web', resource: 'cart', action: 'create' },
      { name: 'cart.edit', guard_name: 'web', resource: 'cart', action: 'edit' },
      { name: 'cart.destroy', guard_name: 'web', resource: 'cart', action: 'destroy' },

      // Checkout (2 permisos)
      { name: 'checkout.index', guard_name: 'web', resource: 'checkout', action: 'index' },
      { name: 'checkout.create', guard_name: 'web', resource: 'checkout', action: 'create' },

      // Address (4 permisos)
      { name: 'address.index', guard_name: 'web', resource: 'address', action: 'index' },
      { name: 'address.create', guard_name: 'web', resource: 'address', action: 'create' },
      { name: 'address.edit', guard_name: 'web', resource: 'address', action: 'edit' },
      { name: 'address.destroy', guard_name: 'web', resource: 'address', action: 'destroy' },

      // Users (5 permisos)
      { name: 'users.create', guard_name: 'web', resource: 'users', action: 'create' },
      { name: 'users.read', guard_name: 'web', resource: 'users', action: 'read' },
      { name: 'users.update', guard_name: 'web', resource: 'users', action: 'update' },
      { name: 'users.delete', guard_name: 'web', resource: 'users', action: 'delete' },
      { name: 'users.manage', guard_name: 'web', resource: 'users', action: 'manage' },

      // Roles (5 permisos)
      { name: 'roles.create', guard_name: 'web', resource: 'roles', action: 'create' },
      { name: 'roles.read', guard_name: 'web', resource: 'roles', action: 'read' },
      { name: 'roles.update', guard_name: 'web', resource: 'roles', action: 'update' },
      { name: 'roles.delete', guard_name: 'web', resource: 'roles', action: 'delete' },
      { name: 'permissions.manage', guard_name: 'web', resource: 'permissions', action: 'manage' },

      // Products (5 permisos)
      { name: 'products.create', guard_name: 'web', resource: 'products', action: 'create' },
      { name: 'products.read', guard_name: 'web', resource: 'products', action: 'read' },
      { name: 'products.update', guard_name: 'web', resource: 'products', action: 'update' },
      { name: 'products.delete', guard_name: 'web', resource: 'products', action: 'delete' },
      { name: 'products.manage', guard_name: 'web', resource: 'products', action: 'manage' },

      // Categories (5 permisos)
      { name: 'categories.create', guard_name: 'web', resource: 'categories', action: 'create' },
      { name: 'categories.read', guard_name: 'web', resource: 'categories', action: 'read' },
      { name: 'categories.update', guard_name: 'web', resource: 'categories', action: 'update' },
      { name: 'categories.delete', guard_name: 'web', resource: 'categories', action: 'delete' },
      { name: 'categories.manage', guard_name: 'web', resource: 'categories', action: 'manage' },

      // Brands (5 permisos)
      { name: 'brands.create', guard_name: 'web', resource: 'brands', action: 'create' },
      { name: 'brands.read', guard_name: 'web', resource: 'brands', action: 'read' },
      { name: 'brands.update', guard_name: 'web', resource: 'brands', action: 'update' },
      { name: 'brands.delete', guard_name: 'web', resource: 'brands', action: 'delete' },
      { name: 'brands.manage', guard_name: 'web', resource: 'brands', action: 'manage' },

      // Orders (5 permisos)
      { name: 'orders.create', guard_name: 'web', resource: 'orders', action: 'create' },
      { name: 'orders.read', guard_name: 'web', resource: 'orders', action: 'read' },
      { name: 'orders.update', guard_name: 'web', resource: 'orders', action: 'update' },
      { name: 'orders.delete', guard_name: 'web', resource: 'orders', action: 'delete' },
      { name: 'orders.manage', guard_name: 'web', resource: 'orders', action: 'manage' },

      // Stores (5 permisos)
      { name: 'stores.create', guard_name: 'web', resource: 'stores', action: 'create' },
      { name: 'stores.read', guard_name: 'web', resource: 'stores', action: 'read' },
      { name: 'stores.update', guard_name: 'web', resource: 'stores', action: 'update' },
      { name: 'stores.delete', guard_name: 'web', resource: 'stores', action: 'delete' },
      { name: 'stores.manage', guard_name: 'web', resource: 'stores', action: 'manage' },

      // Shipping (5 permisos)
      { name: 'shipping.create', guard_name: 'web', resource: 'shipping', action: 'create' },
      { name: 'shipping.read', guard_name: 'web', resource: 'shipping', action: 'read' },
      { name: 'shipping.update', guard_name: 'web', resource: 'shipping', action: 'update' },
      { name: 'shipping.delete', guard_name: 'web', resource: 'shipping', action: 'delete' },
      { name: 'shipping.manage', guard_name: 'web', resource: 'shipping', action: 'manage' },

      // Taxes (5 permisos)
      { name: 'taxes.create', guard_name: 'web', resource: 'taxes', action: 'create' },
      { name: 'taxes.read', guard_name: 'web', resource: 'taxes', action: 'read' },
      { name: 'taxes.update', guard_name: 'web', resource: 'taxes', action: 'update' },
      { name: 'taxes.delete', guard_name: 'web', resource: 'taxes', action: 'delete' },
      { name: 'taxes.manage', guard_name: 'web', resource: 'taxes', action: 'manage' },

      // Coupons (5 permisos)
      { name: 'coupons.create', guard_name: 'web', resource: 'coupons', action: 'create' },
      { name: 'coupons.read', guard_name: 'web', resource: 'coupons', action: 'read' },
      { name: 'coupons.update', guard_name: 'web', resource: 'coupons', action: 'update' },
      { name: 'coupons.delete', guard_name: 'web', resource: 'coupons', action: 'delete' },
      { name: 'coupons.manage', guard_name: 'web', resource: 'coupons', action: 'manage' },

      // Blogs (5 permisos)
      { name: 'blogs.create', guard_name: 'web', resource: 'blogs', action: 'create' },
      { name: 'blogs.read', guard_name: 'web', resource: 'blogs', action: 'read' },
      { name: 'blogs.update', guard_name: 'web', resource: 'blogs', action: 'update' },
      { name: 'blogs.delete', guard_name: 'web', resource: 'blogs', action: 'delete' },
      { name: 'blogs.manage', guard_name: 'web', resource: 'blogs', action: 'manage' },

      // Pages (5 permisos)
      { name: 'pages.create', guard_name: 'web', resource: 'pages', action: 'create' },
      { name: 'pages.read', guard_name: 'web', resource: 'pages', action: 'read' },
      { name: 'pages.update', guard_name: 'web', resource: 'pages', action: 'update' },
      { name: 'pages.delete', guard_name: 'web', resource: 'pages', action: 'delete' },
      { name: 'pages.manage', guard_name: 'web', resource: 'pages', action: 'manage' },

      // FAQs (5 permisos)
      { name: 'faqs.create', guard_name: 'web', resource: 'faqs', action: 'create' },
      { name: 'faqs.read', guard_name: 'web', resource: 'faqs', action: 'read' },
      { name: 'faqs.update', guard_name: 'web', resource: 'faqs', action: 'update' },
      { name: 'faqs.delete', guard_name: 'web', resource: 'faqs', action: 'delete' },
      { name: 'faqs.manage', guard_name: 'web', resource: 'faqs', action: 'manage' },

      // Themes (5 permisos)
      { name: 'themes.create', guard_name: 'web', resource: 'themes', action: 'create' },
      { name: 'themes.read', guard_name: 'web', resource: 'themes', action: 'read' },
      { name: 'themes.update', guard_name: 'web', resource: 'themes', action: 'update' },
      { name: 'themes.delete', guard_name: 'web', resource: 'themes', action: 'delete' },
      { name: 'themes.manage', guard_name: 'web', resource: 'themes', action: 'manage' },

      // Settings (3 permisos)
      { name: 'settings.read', guard_name: 'web', resource: 'settings', action: 'read' },
      { name: 'settings.update', guard_name: 'web', resource: 'settings', action: 'update' },
      { name: 'settings.manage', guard_name: 'web', resource: 'settings', action: 'manage' },

      // Reports (3 permisos)
      { name: 'reports.read', guard_name: 'web', resource: 'reports', action: 'read' },
      { name: 'reports.export', guard_name: 'web', resource: 'reports', action: 'export' },
      { name: 'reports.manage', guard_name: 'web', resource: 'reports', action: 'manage' },

      // Dashboard (2 permisos)
      { name: 'dashboard.read', guard_name: 'web', resource: 'dashboard', action: 'read' },
      { name: 'dashboard.manage', guard_name: 'web', resource: 'dashboard', action: 'manage' },

      // Notifications (2 permisos)
      { name: 'notifications.read', guard_name: 'web', resource: 'notifications', action: 'read' },
      { name: 'notifications.manage', guard_name: 'web', resource: 'notifications', action: 'manage' },

      // Payments (2 permisos)
      { name: 'payments.read', guard_name: 'web', resource: 'payments', action: 'read' },
      { name: 'payments.manage', guard_name: 'web', resource: 'payments', action: 'manage' },

      // Commissions (2 permisos)
      { name: 'commissions.read', guard_name: 'web', resource: 'commissions', action: 'read' },
      { name: 'commissions.manage', guard_name: 'web', resource: 'commissions', action: 'manage' },

      // Wallets (2 permisos)
      { name: 'wallets.read', guard_name: 'web', resource: 'wallets', action: 'read' },
      { name: 'wallets.manage', guard_name: 'web', resource: 'wallets', action: 'manage' },

      // Withdrawals (2 permisos)
      { name: 'withdrawals.read', guard_name: 'web', resource: 'withdrawals', action: 'read' },
      { name: 'withdrawals.manage', guard_name: 'web', resource: 'withdrawals', action: 'manage' },

      // Refunds (2 permisos)
      { name: 'refunds.read', guard_name: 'web', resource: 'refunds', action: 'read' },
      { name: 'refunds.manage', guard_name: 'web', resource: 'refunds', action: 'manage' },

      // Questions (2 permisos)
      { name: 'questions.read', guard_name: 'web', resource: 'questions', action: 'read' },
      { name: 'questions.manage', guard_name: 'web', resource: 'questions', action: 'manage' },

      // Reviews (2 permisos)
      { name: 'reviews.read', guard_name: 'web', resource: 'reviews', action: 'read' },
      { name: 'reviews.manage', guard_name: 'web', resource: 'reviews', action: 'manage' },

      // Points (2 permisos)
      { name: 'points.read', guard_name: 'web', resource: 'points', action: 'read' },
      { name: 'points.manage', guard_name: 'web', resource: 'points', action: 'manage' },

      // Licenses (2 permisos)
      { name: 'licenses.read', guard_name: 'web', resource: 'licenses', action: 'read' },
      { name: 'licenses.manage', guard_name: 'web', resource: 'licenses', action: 'manage' },

      // Media (2 permisos)
      { name: 'media.read', guard_name: 'web', resource: 'media', action: 'read' },
      { name: 'media.manage', guard_name: 'web', resource: 'media', action: 'manage' },

      // Menus (2 permisos)
      { name: 'menus.read', guard_name: 'web', resource: 'menus', action: 'read' },
      { name: 'menus.manage', guard_name: 'web', resource: 'menus', action: 'manage' },

      // Notices (2 permisos)
      { name: 'notices.read', guard_name: 'web', resource: 'notices', action: 'read' },
      { name: 'notices.manage', guard_name: 'web', resource: 'notices', action: 'manage' },

      // Subscriptions (2 permisos)
      { name: 'subscriptions.read', guard_name: 'web', resource: 'subscriptions', action: 'read' },
      { name: 'subscriptions.manage', guard_name: 'web', resource: 'subscriptions', action: 'manage' },

      // Attributes (2 permisos)
      { name: 'attributes.read', guard_name: 'web', resource: 'attributes', action: 'read' },
      { name: 'attributes.manage', guard_name: 'web', resource: 'attributes', action: 'manage' },

      // Tags (2 permisos)
      { name: 'tags.read', guard_name: 'web', resource: 'tags', action: 'read' },
      { name: 'tags.manage', guard_name: 'web', resource: 'tags', action: 'manage' },

      // Currencies (2 permisos)
      { name: 'currencies.read', guard_name: 'web', resource: 'currencies', action: 'read' },
      { name: 'currencies.manage', guard_name: 'web', resource: 'currencies', action: 'manage' },

      // Countries (2 permisos)
      { name: 'countries.read', guard_name: 'web', resource: 'countries', action: 'read' },
      { name: 'countries.manage', guard_name: 'web', resource: 'countries', action: 'manage' },

      // States (2 permisos)
      { name: 'states.read', guard_name: 'web', resource: 'states', action: 'read' },
      { name: 'states.manage', guard_name: 'web', resource: 'states', action: 'manage' },

      // Cities (2 permisos)
      { name: 'cities.read', guard_name: 'web', resource: 'cities', action: 'read' },
      { name: 'cities.manage', guard_name: 'web', resource: 'cities', action: 'manage' },

      // Product Attributes (2 permisos)
      { name: 'product-attributes.read', guard_name: 'web', resource: 'product-attributes', action: 'read' },
      { name: 'product-attributes.manage', guard_name: 'web', resource: 'product-attributes', action: 'manage' },

      // Product Variants (2 permisos)
      { name: 'product-variants.read', guard_name: 'web', resource: 'product-variants', action: 'read' },
      { name: 'product-variants.manage', guard_name: 'web', resource: 'product-variants', action: 'manage' },

      // Inventory (2 permisos)
      { name: 'inventory.read', guard_name: 'web', resource: 'inventory', action: 'read' },
      { name: 'inventory.manage', guard_name: 'web', resource: 'inventory', action: 'manage' },

      // Discounts (2 permisos)
      { name: 'discounts.read', guard_name: 'web', resource: 'discounts', action: 'read' },
      { name: 'discounts.manage', guard_name: 'web', resource: 'discounts', action: 'manage' },

      // Promotions (2 permisos)
      { name: 'promotions.read', guard_name: 'web', resource: 'promotions', action: 'read' },
      { name: 'promotions.manage', guard_name: 'web', resource: 'promotions', action: 'manage' },

      // Discount Codes (2 permisos)
      { name: 'discount-codes.read', guard_name: 'web', resource: 'discount-codes', action: 'read' },
      { name: 'discount-codes.manage', guard_name: 'web', resource: 'discount-codes', action: 'manage' },

      // Promotion Codes (2 permisos)
      { name: 'promotion-codes.read', guard_name: 'web', resource: 'promotion-codes', action: 'read' },
      { name: 'promotion-codes.manage', guard_name: 'web', resource: 'promotion-codes', action: 'manage' },

      // Coupon Codes (2 permisos)
      { name: 'coupon-codes.read', guard_name: 'web', resource: 'coupon-codes', action: 'read' },
      { name: 'coupon-codes.manage', guard_name: 'web', resource: 'coupon-codes', action: 'manage' },

      // Special Discounts (2 permisos)
      { name: 'special-discounts.read', guard_name: 'web', resource: 'special-discounts', action: 'read' },
      { name: 'special-discounts.manage', guard_name: 'web', resource: 'special-discounts', action: 'manage' },

      // Special Promotions (2 permisos)
      { name: 'special-promotions.read', guard_name: 'web', resource: 'special-promotions', action: 'read' },
      { name: 'special-promotions.manage', guard_name: 'web', resource: 'special-promotions', action: 'manage' },

      // Special Coupons (2 permisos)
      { name: 'special-coupons.read', guard_name: 'web', resource: 'special-coupons', action: 'read' },
      { name: 'special-coupons.manage', guard_name: 'web', resource: 'special-coupons', action: 'manage' },

      // User Discounts (2 permisos)
      { name: 'user-discounts.read', guard_name: 'web', resource: 'user-discounts', action: 'read' },
      { name: 'user-discounts.manage', guard_name: 'web', resource: 'user-discounts', action: 'manage' },

      // User Promotions (2 permisos)
      { name: 'user-promotions.read', guard_name: 'web', resource: 'user-promotions', action: 'read' },
      { name: 'user-promotions.manage', guard_name: 'web', resource: 'user-promotions', action: 'manage' },

      // User Coupons (2 permisos)
      { name: 'user-coupons.read', guard_name: 'web', resource: 'user-coupons', action: 'read' },
      { name: 'user-coupons.manage', guard_name: 'web', resource: 'user-coupons', action: 'manage' },

      // Product Discounts (2 permisos)
      { name: 'product-discounts.read', guard_name: 'web', resource: 'product-discounts', action: 'read' },
      { name: 'product-discounts.manage', guard_name: 'web', resource: 'product-discounts', action: 'manage' },

      // Product Promotions (2 permisos)
      { name: 'product-promotions.read', guard_name: 'web', resource: 'product-promotions', action: 'read' },
      { name: 'product-promotions.manage', guard_name: 'web', resource: 'product-promotions', action: 'manage' },

      // Product Coupons (2 permisos)
      { name: 'product-coupons.read', guard_name: 'web', resource: 'product-coupons', action: 'read' },
      { name: 'product-coupons.manage', guard_name: 'web', resource: 'product-coupons', action: 'manage' },

      // Category Discounts (2 permisos)
      { name: 'category-discounts.read', guard_name: 'web', resource: 'category-discounts', action: 'read' },
      { name: 'category-discounts.manage', guard_name: 'web', resource: 'category-discounts', action: 'manage' },

      // Category Promotions (2 permisos)
      { name: 'category-promotions.read', guard_name: 'web', resource: 'category-promotions', action: 'read' },
      { name: 'category-promotions.manage', guard_name: 'web', resource: 'category-promotions', action: 'manage' },

      // Category Coupons (2 permisos)
      { name: 'category-coupons.read', guard_name: 'web', resource: 'category-coupons', action: 'read' },
      { name: 'category-coupons.manage', guard_name: 'web', resource: 'category-coupons', action: 'manage' },

      // Brand Discounts (2 permisos)
      { name: 'brand-discounts.read', guard_name: 'web', resource: 'brand-discounts', action: 'read' },
      { name: 'brand-discounts.manage', guard_name: 'web', resource: 'brand-discounts', action: 'manage' },

      // Brand Promotions (2 permisos)
      { name: 'brand-promotions.read', guard_name: 'web', resource: 'brand-promotions', action: 'read' },
      { name: 'brand-promotions.manage', guard_name: 'web', resource: 'brand-promotions', action: 'manage' },

      // Brand Coupons (2 permisos)
      { name: 'brand-coupons.read', guard_name: 'web', resource: 'brand-coupons', action: 'read' },
      { name: 'brand-coupons.manage', guard_name: 'web', resource: 'brand-coupons', action: 'manage' },

      // Store Discounts (2 permisos)
      { name: 'store-discounts.read', guard_name: 'web', resource: 'store-discounts', action: 'read' },
      { name: 'store-discounts.manage', guard_name: 'web', resource: 'store-discounts', action: 'manage' },

      // Store Promotions (2 permisos)
      { name: 'store-promotions.read', guard_name: 'web', resource: 'store-promotions', action: 'read' },
      { name: 'store-promotions.manage', guard_name: 'web', resource: 'store-promotions', action: 'manage' },

      // Store Coupons (2 permisos)
      { name: 'store-coupons.read', guard_name: 'web', resource: 'store-coupons', action: 'read' },
      { name: 'store-coupons.manage', guard_name: 'web', resource: 'store-coupons', action: 'manage' },

      // User Product Discounts (2 permisos)
      { name: 'user-product-discounts.read', guard_name: 'web', resource: 'user-product-discounts', action: 'read' },
      { name: 'user-product-discounts.manage', guard_name: 'web', resource: 'user-product-discounts', action: 'manage' },

      // User Product Promotions (2 permisos)
      { name: 'user-product-promotions.read', guard_name: 'web', resource: 'user-product-promotions', action: 'read' },
      { name: 'user-product-promotions.manage', guard_name: 'web', resource: 'user-product-promotions', action: 'manage' },

      // User Product Coupons (2 permisos)
      { name: 'user-product-coupons.read', guard_name: 'web', resource: 'user-product-coupons', action: 'read' },
      { name: 'user-product-coupons.manage', guard_name: 'web', resource: 'user-product-coupons', action: 'manage' },

      // User Category Discounts (2 permisos)
      { name: 'user-category-discounts.read', guard_name: 'web', resource: 'user-category-discounts', action: 'read' },
      { name: 'user-category-discounts.manage', guard_name: 'web', resource: 'user-category-discounts', action: 'manage' },

      // User Category Promotions (2 permisos)
      { name: 'user-category-promotions.read', guard_name: 'web', resource: 'user-category-promotions', action: 'read' },
      { name: 'user-category-promotions.manage', guard_name: 'web', resource: 'user-category-promotions', action: 'manage' },

      // User Category Coupons (2 permisos)
      { name: 'user-category-coupons.read', guard_name: 'web', resource: 'user-category-coupons', action: 'read' },
      { name: 'user-category-coupons.manage', guard_name: 'web', resource: 'user-category-coupons', action: 'manage' },

      // User Brand Discounts (2 permisos)
      { name: 'user-brand-discounts.read', guard_name: 'web', resource: 'user-brand-discounts', action: 'read' },
      { name: 'user-brand-discounts.manage', guard_name: 'web', resource: 'user-brand-discounts', action: 'manage' },

      // User Brand Promotions (2 permisos)
      { name: 'user-brand-promotions.read', guard_name: 'web', resource: 'user-brand-promotions', action: 'read' },
      { name: 'user-brand-promotions.manage', guard_name: 'web', resource: 'user-brand-promotions', action: 'manage' },

      // User Brand Coupons (2 permisos)
      { name: 'user-brand-coupons.read', guard_name: 'web', resource: 'user-brand-coupons', action: 'read' },
      { name: 'user-brand-coupons.manage', guard_name: 'web', resource: 'user-brand-coupons', action: 'manage' },

      // User Store Discounts (2 permisos)
      { name: 'user-store-discounts.read', guard_name: 'web', resource: 'user-store-discounts', action: 'read' },
      { name: 'user-store-discounts.manage', guard_name: 'web', resource: 'user-store-discounts', action: 'manage' },

      // User Store Promotions (2 permisos)
      { name: 'user-store-promotions.read', guard_name: 'web', resource: 'user-store-promotions', action: 'read' },
      { name: 'user-store-promotions.manage', guard_name: 'web', resource: 'user-store-promotions', action: 'manage' },

      // User Store Coupons (2 permisos)
      { name: 'user-store-coupons.read', guard_name: 'web', resource: 'user-store-coupons', action: 'read' },
      { name: 'user-store-coupons.manage', guard_name: 'web', resource: 'user-store-coupons', action: 'manage' }
    ];

    console.log(`📋 Insertando ${realPermissions.length} permisos reales...`);
    
    // Insertar permisos
    const createdPermissions = [];
    for (const permissionData of realPermissions) {
      const permission = new PermissionModel(permissionData);
      await (permission as any).save();
      createdPermissions.push(permission);
      console.log(`   ✅ Permiso creado: ${(permission as any).name}`);
    }

    // Encontrar o crear el rol 'admin'
    let adminRole = await RoleModel.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('❌ Rol "admin" no encontrado. Creando uno por defecto.');
      adminRole = new RoleModel({
        name: 'admin',
        guard_name: 'web',
        system_reserve: 1,
        description: 'Rol de administrador del sistema'
      });
      await (adminRole as any).save();
      console.log(`   ✅ Rol "admin" creado con ID: ${(adminRole as any).id}`);
    }

    // Asignar todos los permisos al rol admin
    console.log(`🛡️ Asignando todos los permisos al rol admin (ID: ${(adminRole as any).id})...`);
    const rolePermissions = createdPermissions.map((permission: any) => ({
      role_id: (adminRole as any).id,
      permission_id: permission.id
    }));

    await RolePermissionModel.insertMany(rolePermissions);
    console.log(`   ✅ ${rolePermissions.length} permisos asignados al rol admin`);

    console.log(`\n🎉 ¡Permisos reales cargados exitosamente!`);
    console.log(`📊 Total de permisos: ${realPermissions.length}`);
    console.log(`🛡️ Permisos asignados al admin: ${rolePermissions.length}`);

  } catch (error) {
    console.error('❌ Error al cargar permisos reales:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

loadRealPermissions().catch(error => {
  console.error('Error en el script de carga de permisos reales:', error);
  process.exit(1);
});
