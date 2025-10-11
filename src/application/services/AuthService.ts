import { injectable } from "tsyringe";
import jwt from "jsonwebtoken";
import { authConfig } from "../../config/auth";

@injectable()
export class AuthService {
  private readonly JWT_SECRET = authConfig.JWT_SECRET;
  private readonly JWT_EXPIRES_IN = authConfig.JWT_EXPIRES_IN;
  private readonly OTP_EXPIRES_IN = authConfig.OTP_EXPIRES_IN;

  // Almacenamiento temporal para OTPs (en producción usar Redis)
  private otpStorage = new Map<string, { otp: string; expiresAt: number }>();

  generateToken(userId: number, email: string): string {
    try {
      const payload = {
        userId,
        email,
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN,
      } as jwt.SignOptions);
    } catch (error) {
      throw new Error("Error al generar token de autenticación");
    }
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOTP(identifier: string, otp: string): void {
    const expiresAt = Date.now() + this.OTP_EXPIRES_IN;
    this.otpStorage.set(identifier, { otp, expiresAt });

    // Limpiar OTPs expirados
    this.cleanExpiredOTPs();
  }

  verifyOTP(identifier: string, otp: string): boolean {
    const stored = this.otpStorage.get(identifier);

    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStorage.delete(identifier);
      return false;
    }

    const isValid = stored.otp === otp;
    if (isValid) {
      this.otpStorage.delete(identifier);
    }

    return isValid;
  }

  private cleanExpiredOTPs(): void {
    const now = Date.now();
    for (const [key, value] of this.otpStorage.entries()) {
      if (now > value.expiresAt) {
        this.otpStorage.delete(key);
      }
    }
  }

  async hashPassword(password: string): Promise<string> {
    const bcrypt = require("bcryptjs");
    return bcrypt.hash(password, authConfig.BCRYPT_SALT_ROUNDS);
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    const bcrypt = require("bcryptjs");
    return bcrypt.compare(password, hashedPassword);
  }
}
