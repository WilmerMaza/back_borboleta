import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../application/services/AuthService';
import { container } from 'tsyringe';
import { Logger } from '../shared/utils/logger';

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
    Logger.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    Logger.log('Token extraído:', token ? 'Token presente' : 'Token ausente');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
      return;
    }

    const authService = container.resolve(AuthService);
    const decoded = authService.verifyToken(token);
    
    Logger.log('Token decodificado:', decoded);
    
    // Validar que el token decodificado tenga userId
    if (!decoded || !decoded.userId) {
      Logger.error('Token decodificado no contiene userId:', decoded);
      res.status(401).json({
        success: false,
        message: 'Token inválido: userId no encontrado'
      });
      return;
    }
    
    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    Logger.log('Usuario agregado al request:', req.user);
    next();
  } catch (error: any) {
    Logger.error('Error en autenticación:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};
