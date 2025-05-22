import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Conexión a MongoDB establecida correctamente');

    // Definir el esquema de productos
    const productSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      image_url: {
        type: String
      },
      category: {
        type: String,
        required: true,
        trim: true
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
      }
    }, {
      timestamps: true
    });

    // Crear el modelo
    const Product = mongoose.model('Product', productSchema);

    // Crear un producto de prueba
    const testProduct = new Product({
      name: "Producto de prueba",
      description: "Este es un producto de prueba",
      price: 99.99,
      stock: 10,
      category: "General",
      status: "active"
    });

    // Guardar el producto
    await testProduct.save();
    console.log('✅ Producto de prueba creado correctamente');

    // Mostrar los productos
    const products = await Product.find();
    console.log('Productos en la base de datos:', products);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
};

initDatabase();