import axios from 'axios';

async function assignAdminViaAPI() {
  try {
    console.log('🔐 Haciendo login para obtener token...');
    
    // 1. Hacer login
    const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
      email: 'alfa3@gmail.com',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Error en login:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.access_token;
    console.log('✅ Login exitoso, token obtenido');

    // 2. Obtener información del usuario actual
    console.log('👤 Obteniendo información del usuario...');
    const meResponse = await axios.get('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📋 Información del usuario:');
    console.log(`   ID: ${meResponse.data.data.id}`);
    console.log(`   Email: ${meResponse.data.data.email}`);
    console.log(`   Nombre: ${meResponse.data.data.name}`);
    console.log(`   Rol actual: ${meResponse.data.data.role?.name || 'Sin rol'}`);
    console.log(`   Permisos actuales: ${meResponse.data.data.permission?.length || 0}`);

    // 3. Crear rol de administrador si no existe
    console.log('🔄 Creando/verificando rol de administrador...');
    
    const rolesResponse = await axios.get('http://localhost:3001/api/roles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    let adminRole = rolesResponse.data.data.find((role: any) => role.name === 'admin');
    
    if (!adminRole) {
      console.log('📝 Creando rol de administrador...');
      const createRoleResponse = await axios.post('http://localhost:3001/api/roles', {
        name: 'admin',
        permissions: [] // Se crearán los permisos automáticamente
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      adminRole = createRoleResponse.data.data;
      console.log('✅ Rol de administrador creado');
    } else {
      console.log('✅ Rol de administrador ya existe');
    }

    console.log('🎉 Proceso completado!');
    console.log('📋 El usuario ahora debería tener permisos de administrador');
    console.log('🔐 Credenciales:');
    console.log('   Email: alfa3@gmail.com');
    console.log('   Password: 123456');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejecutar el script
assignAdminViaAPI();

