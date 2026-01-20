import dotenv from 'dotenv';
import mongoose from 'mongoose';
import OrderStatusModel from '../infrastructure/database/models/OrderStatusModel';
import connectDB from '../infrastructure/database/config/database';

dotenv.config();

const orderStatuses = [
  {
    id: 1,
    name: 'pending',
    slug: 'pending',
    sequence: 1,
    activities_date: new Date().toISOString(),
    created_by_id: 1,
    status: true,
    deleted_at: null
  },
  {
    id: 2,
    name: 'processing',
    slug: 'processing',
    sequence: 2,
    activities_date: new Date().toISOString(),
    created_by_id: 1,
    status: true,
    deleted_at: null
  },
  {
    id: 3,
    name: 'cancelled',
    slug: 'cancelled',
    sequence: 3,
    activities_date: new Date().toISOString(),
    created_by_id: 1,
    status: true,
    deleted_at: null
  },
  {
    id: 4,
    name: 'shipped',
    slug: 'shipped',
    sequence: 4,
    activities_date: new Date().toISOString(),
    created_by_id: 1,
    status: true,
    deleted_at: null
  },
  {
    id: 5,
    name: 'out_for_delivery',
    slug: 'out-for-delivery',
    sequence: 5,
    activities_date: new Date().toISOString(),
    created_by_id: 1,
    status: true,
    deleted_at: null
  },
  {
    id: 6,
    name: 'delivered',
    slug: 'delivered',
    sequence: 6,
    activities_date: new Date().toISOString(),
    created_by_id: 1,
    status: true,
    deleted_at: null
  }
];

async function initOrderStatuses() {
  await connectDB();
  console.log('✅ Conectado a MongoDB\n');

  try {
    console.log('🔄 Iniciando inserción de estados de órdenes...\n');

    for (const statusData of orderStatuses) {
      // Verificar si el estado ya existe por slug o id
      const existingBySlug = await OrderStatusModel.findOne({ slug: statusData.slug });
      const existingById = await OrderStatusModel.findOne({ id: statusData.id });

      if (existingBySlug || existingById) {
        console.log(`⚠️  Estado "${statusData.name}" (ID: ${statusData.id}, Slug: ${statusData.slug}) ya existe, actualizando...`);
        
        // Actualizar el estado existente
        await OrderStatusModel.findOneAndUpdate(
          { $or: [{ slug: statusData.slug }, { id: statusData.id }] },
          {
            name: statusData.name,
            slug: statusData.slug,
            sequence: statusData.sequence,
            activities_date: statusData.activities_date,
            created_by_id: statusData.created_by_id,
            status: statusData.status,
            deleted_at: statusData.deleted_at
          },
          { new: true }
        );
        console.log(`   ✅ Estado actualizado: ${statusData.name}\n`);
      } else {
        // Crear nuevo estado
        const newStatus = new OrderStatusModel(statusData);
        await (newStatus as any).save();
        console.log(`   ✅ Estado creado: ${statusData.name} (ID: ${statusData.id}, Slug: ${statusData.slug})\n`);
      }
    }

    console.log('🎉 Proceso completado!\n');
    console.log('📋 Resumen de estados:');
    const allStatuses = await OrderStatusModel.find({});
    allStatuses.forEach((status: any) => {
      const sObj = (status as any).toObject ? (status as any).toObject() : status;
      console.log(`   - ID: ${sObj.id}, Slug: ${sObj.slug}, Nombre: ${sObj.name}, Activo: ${sObj.status}`);
    });

  } catch (error: any) {
    console.error('❌ Error al insertar estados de órdenes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

initOrderStatuses().catch(error => {
  console.error('Error en el script:', error);
  process.exit(1);
});

