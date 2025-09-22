import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import connectDB from '../infrastructure/database/config/database';

async function listAllPermissions() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Obtener todos los permisos ordenados por nombre
    const permissions = await PermissionModel.find({}).sort({ name: 1 });
    
    console.log(`\n📋 Total de permisos registrados: ${permissions.length}`);
    console.log('\n🔑 Lista completa de permisos:\n');
    
    // Mostrar permisos agrupados por módulo
    const permissionsByModule: { [key: string]: string[] } = {};
    
    permissions.forEach((permission: any) => {
      const resource = permission.resource || 'sin-modulo';
      if (!permissionsByModule[resource]) {
        permissionsByModule[resource] = [];
      }
      permissionsByModule[resource].push(permission.name);
    });
    
    // Mostrar por módulos
    Object.keys(permissionsByModule).sort().forEach(module => {
      console.log(`\n📂 MÓDULO: ${module.toUpperCase()}`);
      console.log('─'.repeat(50));
      permissionsByModule[module].forEach((permissionName, index) => {
        console.log(`${(index + 1).toString().padStart(3, ' ')}. ${permissionName}`);
      });
    });
    
    // Mostrar lista simple de todos los nombres
    console.log('\n\n📝 LISTA SIMPLE DE TODOS LOS PERMISOS:');
    console.log('═'.repeat(60));
    permissions.forEach((permission: any, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${permission.name}`);
    });
    
    // Estadísticas por módulo
    console.log('\n\n📊 ESTADÍSTICAS POR MÓDULO:');
    console.log('═'.repeat(40));
    Object.keys(permissionsByModule).sort().forEach(module => {
      const count = permissionsByModule[module].length;
      console.log(`${module.padEnd(20, ' ')}: ${count.toString().padStart(3, ' ')} permisos`);
    });
    
    console.log(`\n🎯 TOTAL: ${permissions.length} permisos registrados`);
    
  } catch (error) {
    console.error('❌ Error al listar permisos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

listAllPermissions().catch(error => {
  console.error('Error en el script de listado de permisos:', error);
  process.exit(1);
});
