const sequelize = require('./db');
const Product = require('../models/Product');

async function syncDatabase() {
  try {
    // Sincronizar todos los modelos
    await sequelize.sync({ force: false }); // force: false para no eliminar tablas existentes
    console.log('✅ Base de datos sincronizada correctamente');

    // Probar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  }
}

syncDatabase();