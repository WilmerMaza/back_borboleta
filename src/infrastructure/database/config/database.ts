import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://alejandraalfaro:SXmH5mJ2tVigJ7ck@borboleta.egefkn1.mongodb.net/?retryWrites=true&w=majority&appName=Borboleta';
    
  

    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado exitosamente');
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', (error) => {
      console.error('❌ Error de conexión MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB; 