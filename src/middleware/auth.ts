import { Request, Response, NextFunction } from "express";
import { AuthService } from "../application/services/AuthService";
import { container } from "tsyringe";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
      return;
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
      return;
    }

    const authService = container.resolve(AuthService);
    const decoded = authService.verifyToken(token);

    // Validar que el token decodificado tenga userId
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        message: "Token inválido: userId no encontrado",
      });
      return;
    }

    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};
