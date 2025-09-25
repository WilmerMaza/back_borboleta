export const authConfig = {
  JWT_SECRET: process.env.JWT_SECRET ||  'SECRET_KEY',
  JWT_EXPIRES_IN: '24h', 
  OTP_EXPIRES_IN: 9 * 60 * 1000, 
  BCRYPT_SALT_ROUNDS: 10
};


