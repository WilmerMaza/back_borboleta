import {  Response } from 'express';

export class ErrorHandler {
  static handleError = (error: Error, res: Response) => {
    console.error('Error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  };

  static handleNotFound = ( res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Ruta no encontrada'
    });
  };
}