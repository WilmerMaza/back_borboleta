export const authConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'tu_secreto_jwt_muy_seguro_aqui_cambiar_en_produccion',
  JWT_EXPIRES_IN: '1h',
  OTP_EXPIRES_IN: 5 * 60 * 1000, // 5 minutos en milisegundos
  BCRYPT_SALT_ROUNDS: 10
};


