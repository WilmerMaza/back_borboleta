import mongoose from 'mongoose';
import ProductModel from '../infrastructure/database/models/ProductModel';

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';

async function createTestProducts() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Productos de prueba
    const testProducts = [
      {
        name: 'Laptop Gaming Pro',
        description: 'Laptop de alto rendimiento para gaming',
        price: 1299.99,
        discount: 15,
        stock: 50,
        sku: 'LAP001',
        brand_id: 1,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Smartphone Galaxy S24',
        description: 'Smartphone de última generación',
        price: 899.99,
        discount: 10,
        stock: 100,
        sku: 'PHN001',
        brand_id: 2,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Auriculares Wireless Premium',
        description: 'Auriculares bluetooth con cancelación de ruido',
        price: 199.99,
        discount: 0,
        stock: 75,
        sku: 'AUD001',
        brand_id: 3,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Tablet iPad Pro',
        description: 'Tablet profesional para creativos',
        price: 1099.99,
        discount: 20,
        stock: 30,
        sku: 'TAB001',
        brand_id: 4,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Smartwatch Series 9',
        description: 'Reloj inteligente con monitoreo de salud',
        price: 399.99,
        discount: 5,
        stock: 60,
        sku: 'WAT001',
        brand_id: 5,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Cámara DSLR Profesional',
        description: 'Cámara réflex digital de alta calidad',
        price: 1499.99,
        discount: 25,
        stock: 20,
        sku: 'CAM001',
        brand_id: 6,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Teclado Mecánico RGB',
        description: 'Teclado gaming con switches mecánicos',
        price: 149.99,
        discount: 0,
        stock: 120,
        sku: 'KEY001',
        brand_id: 7,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Mouse Gaming Pro',
        description: 'Mouse de alta precisión para gaming',
        price: 79.99,
        discount: 10,
        stock: 200,
        sku: 'MOU001',
        brand_id: 8,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Monitor 4K Ultra HD',
        description: 'Monitor de 27 pulgadas con resolución 4K',
        price: 599.99,
        discount: 15,
        stock: 40,
        sku: 'MON001',
        brand_id: 9,
        store_id: 1,
        created_by_id: 1
      },
      {
        name: 'Altavoces Bluetooth',
        description: 'Altavoces portátiles con sonido envolvente',
        price: 129.99,
        discount: 0,
        stock: 80,
        sku: 'SPK001',
        brand_id: 10,
        store_id: 1,
        created_by_id: 1
      }
    ];

    console.log('🔄 Creando productos de prueba...');

    for (let i = 0; i < testProducts.length; i++) {
      const productData = testProducts[i];
      
      // Crear el producto (el numeric_id se generará automáticamente)
      const newProduct = new ProductModel(productData);
      await newProduct.save();
 
    }

    console.log('🎉 Todos los productos de prueba han sido creados exitosamente!');
    console.log('📋 Lista de productos creados:');
    
    // Mostrar todos los productos creados
    const allProducts = await ProductModel.find().sort({ id: 1 });
    allProducts.forEach(product => {
      console.log(`   ID: ${product.id} | ${product.name} | $${product.sale_price}`);
    });

  } catch (error) {
    console.error('❌ Error al crear productos de prueba:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
createTestProducts(); 