import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Función para hacer login y obtener token
async function login() {
  console.log('🔐 Haciendo login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@ejemplo.com', // Usar un usuario existente
      password: 'password123'
    });

    authToken = response.data.data.access_token;
    console.log('✅ Login exitoso, token obtenido');
    return true;
  } catch (error: any) {
    console.log('❌ Error en login:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Función para probar GET /api/roles
async function testGetRoles() {
  console.log('🧪 Probando GET /api/roles...');
  
  try {
    const response = await axios.get(`${BASE_URL}/roles`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Roles obtenidos exitosamente:');
    console.log('   Status:', response.status);
    console.log('   Cantidad de roles:', response.data.data.length);
    console.log('   Primer rol:', response.data.data[0]?.name);
    
    return response.data.data;
  } catch (error: any) {
    console.log('❌ Error al obtener roles:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Función para probar POST /api/roles
async function testCreateRole() {
  console.log('🧪 Probando POST /api/roles...');
  
  try {
    const response = await axios.post(`${BASE_URL}/roles`, {
      name: 'test_role',
      permissions: [1, 2, 3] // IDs de permisos
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Rol creado exitosamente:');
    console.log('   Status:', response.status);
    console.log('   Rol creado:', response.data.data.name);
    console.log('   Permisos asignados:', response.data.data.permissions.length);
    
    return response.data.data;
  } catch (error: any) {
    console.log('❌ Error al crear rol:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Función para probar PUT /api/roles/:id
async function testUpdateRole(roleId: number) {
  console.log('🧪 Probando PUT /api/roles/:id...');
  
  try {
    const response = await axios.put(`${BASE_URL}/roles/${roleId}`, {
      name: 'test_role_updated',
      permissions: [1, 2, 4, 5] // Cambiar permisos
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Rol actualizado exitosamente:');
    console.log('   Status:', response.status);
    console.log('   Nuevo nombre:', response.data.data.name);
    console.log('   Permisos actualizados:', response.data.data.permissions.length);
    
    return response.data.data;
  } catch (error: any) {
    console.log('❌ Error al actualizar rol:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Función para probar GET /api/modules
async function testGetModules() {
  console.log('🧪 Probando GET /api/modules...');
  
  try {
    const response = await axios.get(`${BASE_URL}/roles/modules`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Módulos obtenidos exitosamente:');
    console.log('   Status:', response.status);
    console.log('   Cantidad de módulos:', response.data.data.length);
    console.log('   Primer módulo:', response.data.data[0]?.name);
    console.log('   Permisos del primer módulo:', response.data.data[0]?.permissions.length);
    
    return response.data.data;
  } catch (error: any) {
    console.log('❌ Error al obtener módulos:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Función para probar GET /api/auth/me
async function testGetMe() {
  console.log('🧪 Probando GET /api/auth/me...');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Usuario obtenido exitosamente:');
    console.log('   Status:', response.status);
    console.log('   Usuario:', response.data.data.name);
    console.log('   Email:', response.data.data.email);
    console.log('   Rol:', response.data.data.role?.name);
    console.log('   Permisos:', response.data.data.permission?.length || 0);
    
    return response.data.data;
  } catch (error: any) {
    console.log('❌ Error al obtener usuario:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Función para probar DELETE /api/roles/:id
async function testDeleteRole(roleId: number) {
  console.log('🧪 Probando DELETE /api/roles/:id...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/roles/${roleId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Rol eliminado exitosamente:');
    console.log('   Status:', response.status);
    console.log('   Mensaje:', response.data.message);
    
    return true;
  } catch (error: any) {
    console.log('❌ Error al eliminar rol:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Función principal para ejecutar todas las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de endpoints de roles...\n');
  
  // 1. Hacer login
  const loginSuccess = await login();
  console.log('\n');
  
  if (!loginSuccess) {
    console.log('❌ No se pudo hacer login, saltando pruebas restantes');
    return;
  }
  
  // 2. Probar /api/auth/me
  await testGetMe();
  console.log('\n');
  
  // 3. Probar GET /api/roles
  await testGetRoles();
  console.log('\n');
  
  // 4. Probar GET /api/modules
  await testGetModules();
  console.log('\n');
  
  // 5. Probar POST /api/roles
  const newRole = await testCreateRole();
  console.log('\n');
  
  if (newRole) {
    // 6. Probar PUT /api/roles/:id
    await testUpdateRole(newRole.id);
    console.log('\n');
    
    // 7. Probar DELETE /api/roles/:id
    await testDeleteRole(newRole.id);
    console.log('\n');
  }
  
  console.log('🎉 Todas las pruebas completadas!');
}

// Ejecutar las pruebas
runTests().catch(console.error);

