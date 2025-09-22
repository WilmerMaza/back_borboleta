import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

async function testJWT() {
  console.log('🔐 Probando JWT...');
  
  const userId = 11;
  const email = 'admin@borboleta.com';
  const secret = authConfig.JWT_SECRET;
  
  console.log('📋 Configuración:');
  console.log(`   JWT_SECRET: ${secret}`);
  console.log(`   JWT_EXPIRES_IN: ${authConfig.JWT_EXPIRES_IN}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Email: ${email}`);
  
  try {
    // Generar token
    const payload = {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000)
    };
    
    const token = jwt.sign(payload, secret, {
      expiresIn: authConfig.JWT_EXPIRES_IN
    } as jwt.SignOptions);
    
    console.log('\n✅ Token generado:');
    console.log(`   ${token}`);
    
    // Verificar token
    const decoded = jwt.verify(token, secret);
    console.log('\n✅ Token verificado:');
    console.log(`   ${JSON.stringify(decoded, null, 2)}`);
    
    // Probar con el token del log
    const logToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluQGJvcmJvbGV0YS5jb20iLCJpYXQiOjE3NTgxNDYyMTYsImV4cCI6MTc1ODIzMjYxNn0._aEk_XmwNFkbiguHoWIc0qpCPk7bq07-ieA7FiAOEpw';
    
    console.log('\n🔍 Verificando token del log:');
    try {
      const logDecoded = jwt.verify(logToken, secret);
      console.log('✅ Token del log válido:');
      console.log(`   ${JSON.stringify(logDecoded, null, 2)}`);
    } catch (error) {
      console.log('❌ Token del log inválido:');
      console.log(`   ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testJWT();
