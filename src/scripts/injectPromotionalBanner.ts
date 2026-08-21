import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SettingThemeModel } from '../infrastructure/database/models/SettingThemeModel';

dotenv.config();

const promotionalBanner = {
  is_enable: true,
  text: 'Entrega mismo día Cartagena y envíos a todo el país'
};

async function injectPromotionalBanner() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/borboleta';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const result = await SettingThemeModel.updateOne(
      { slug: 'fashion_one' },
      { $set: { 'content.promotional_banner': promotionalBanner } }
    );

    if (result.matchedCount === 0) {
      console.log('❌ Tema "fashion_one" no encontrado');
      return;
    }

    console.log('✅ promotional_banner inyectado correctamente en el tema fashion_one');
    console.log('📦 Contenido agregado:', JSON.stringify(promotionalBanner, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

injectPromotionalBanner();
