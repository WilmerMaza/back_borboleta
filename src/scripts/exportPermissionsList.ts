import mongoose from 'mongoose';
import PermissionModel from '../infrastructure/database/models/PermissionModel';
import connectDB from '../infrastructure/database/config/database';
import fs from 'fs';
import path from 'path';

async function exportPermissionsList() {
  await connectDB();
  console.log('✅ Conectado a MongoDB');

  try {
    // Obtener todos los permisos ordenados por nombre
    const permissions = await PermissionModel.find({}).sort({ name: 1 });
    
    console.log(`📋 Total de permisos: ${permissions.length}`);
    
    // Crear lista simple de nombres
    const permissionNames = permissions.map((permission: any) => permission.name);
    
    // Crear contenido del archivo
    const content = `# Lista de Permisos del Sistema Borboleta
# Total: ${permissions.length} permisos
# Generado: ${new Date().toISOString()}

${permissionNames.join('\n')}

# Lista en formato JSON para fácil comparación
${JSON.stringify(permissionNames, null, 2)}

# Lista en formato array JavaScript
[${permissionNames.map(name => `"${name}"`).join(',\n')}]
`;

    // Guardar archivo
    const filePath = path.join(__dirname, '../../PERMISSIONS_LIST.txt');
    fs.writeFileSync(filePath, content);
    
    console.log(`\n📄 Archivo guardado en: ${filePath}`);
    console.log('\n🔑 Lista de permisos:');
    console.log('═'.repeat(50));
    
    // Mostrar en consola también
    permissionNames.forEach((name, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${name}`);
    });
    
    console.log('\n📊 Estadísticas:');
    console.log(`   Total: ${permissions.length} permisos`);
    
    // Agrupar por módulo para estadísticas
    const moduleStats: { [key: string]: number } = {};
    permissions.forEach((permission: any) => {
      const resource = permission.resource || 'sin-modulo';
      moduleStats[resource] = (moduleStats[resource] || 0) + 1;
    });
    
    console.log('\n📂 Por módulo:');
    Object.keys(moduleStats).sort().forEach(module => {
      console.log(`   ${module}: ${moduleStats[module]} permisos`);
    });
    
  } catch (error) {
    console.error('❌ Error al exportar permisos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

exportPermissionsList().catch(error => {
  console.error('Error en el script de exportación de permisos:', error);
  process.exit(1);
});

