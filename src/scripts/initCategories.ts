import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CategoryModel from '../infrastructure/database/models/CategoryModel';

dotenv.config();

async function initCategories() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta');
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existen categorías
    const existingCategories = await CategoryModel.countDocuments();
    if (existingCategories > 0) {
      console.log(`📋 Ya existen ${existingCategories} categorías en la base de datos`);
      return;
    }

    // Crear categorías básicas
    const categories = [
      {
        name: 'Electrónicos',
        slug: 'electronicos',
        description: 'Dispositivos electrónicos y tecnología',
        type: 'product',
        parent_id: null,
        status: 1
      },
      {
        name: 'Ropa',
        slug: 'ropa',
        description: 'Ropa y accesorios de moda',
        type: 'product',
        parent_id: null,
        status: 1
      },
      {
        name: 'Hogar',
        slug: 'hogar',
        description: 'Productos para el hogar y decoración',
        type: 'product',
        parent_id: null,
        status: 1
      },
      {
        name: 'Deportes',
        slug: 'deportes',
        description: 'Artículos deportivos y fitness',
        type: 'product',
        parent_id: null,
        status: 1
      },
      {
        name: 'Libros',
        slug: 'libros',
        description: 'Libros y material educativo',
        type: 'product',
        parent_id: null,
        status: 1
      }
    ];

    console.log('📝 Creando categorías básicas...');

    // Crear las categorías principales
    const createdCategories = [];
    for (const categoryData of categories) {
      const category = new CategoryModel(categoryData);
      const savedCategory = await category.save();
      createdCategories.push(savedCategory);
      console.log(`✅ Creada categoría: ${savedCategory.name} (ID: ${savedCategory.id})`);
    }

    // Crear algunas subcategorías
    const subcategories = [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Teléfonos inteligentes',
        type: 'product',
        parent_id: createdCategories[0].id.toString(), // Electrónicos
        status: 1
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Computadoras portátiles',
        type: 'product',
        parent_id: createdCategories[0].id.toString(), // Electrónicos
        status: 1
      },
      {
        name: 'Camisetas',
        slug: 'camisetas',
        description: 'Camisetas y tops',
        type: 'product',
        parent_id: createdCategories[1].id.toString(), // Ropa
        status: 1
      },
      {
        name: 'Pantalones',
        slug: 'pantalones',
        description: 'Pantalones y jeans',
        type: 'product',
        parent_id: createdCategories[1].id.toString(), // Ropa
        status: 1
      }
    ];

    console.log('📝 Creando subcategorías...');

    for (const subcategoryData of subcategories) {
      const subcategory = new CategoryModel(subcategoryData);
      const savedSubcategory = await subcategory.save();
      console.log(`✅ Creada subcategoría: ${savedSubcategory.name} (ID: ${savedSubcategory.id})`);
    }

    console.log('🎉 Categorías inicializadas exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar el script
initCategories();




