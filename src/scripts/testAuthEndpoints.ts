import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/auth';

// Función para probar el registro
async function testRegister() {
  console.log('🧪 Probando endpoint de registro...');
  
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      name: 'Usuario de Prueba',
      email: 'test@ejemplo.com',
      password: 'password123',
      password_confirmation: 'password123',
      phone: '1234567890',
      country_code: '1'
    });

    console.log('✅ Registro exitoso:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
    return response.data.data.user;
  } catch (error: any) {
    console.log('❌ Error en registro:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

// Función para probar el login (usando el endpoint existente)
async function testLogin(email: string, password: string) {
  console.log('🧪 Probando endpoint de login...');
  
  try {
    const response = await axios.post('http://localhost:3000/api/users/login', {
      email,
      password
    });

    console.log('✅ Login exitoso:');
    console.log('   Status:', response.status);
    console.log('   Token:', response.data.data.access_token ? 'Presente' : 'Ausente');
    
    return response.data.data.access_token;
  } catch (error: any) {
    console.log('❌ Error en login:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

// Función para probar el endpoint /me
async function testGetMe(token: string) {
  console.log('🧪 Probando endpoint /me...');
  
  try {
    const response = await axios.get(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Obtener usuario exitoso:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
    return response.data.data;
  } catch (error: any) {
    console.log('❌ Error al obtener usuario:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

// Función para probar el logout
async function testLogout(token: string) {
  console.log('🧪 Probando endpoint de logout...');
  
  try {
    const response = await axios.post(`${BASE_URL}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Logout exitoso:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error: any) {
    console.log('❌ Error en logout:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
    return false;
  }
}

// Función principal para ejecutar todas las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de endpoints de autenticación...\n');
  
  // 1. Probar registro
  const user = await testRegister();
  console.log('\n');
  
  if (!user) {
    console.log('❌ No se pudo registrar usuario, saltando pruebas restantes');
    return;
  }
  
  // 2. Probar login
  const token = await testLogin(user.email, 'password123');
  console.log('\n');
  
  if (!token) {
    console.log('❌ No se pudo hacer login, saltando pruebas restantes');
    return;
  }
  
  // 3. Probar /me
  await testGetMe(token);
  console.log('\n');
  
  // 4. Probar logout
  await testLogout(token);
  console.log('\n');
  
  console.log('🎉 Todas las pruebas completadas!');
}

// Ejecutar las pruebas
runTests().catch(console.error);

