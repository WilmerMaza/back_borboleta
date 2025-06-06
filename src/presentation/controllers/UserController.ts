import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { RegisterUserCommand } from '../../application/commands/user/RegisterUserCommand';
import { RegisterUserHandler } from '../../application/command-handlers/user/RegisterUserHandler';
import { Logger } from '../../shared/utils/logger';

@injectable()
export class UserController {
  constructor(
    @inject("RegisterUserHandler") private registerUserHandler: RegisterUserHandler
  ) {}

  handleRegisterUser = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de registro recibida', req.body);
      
      const command = new RegisterUserCommand(req.body);
      const user = await this.registerUserHandler.handle(command);

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      Logger.error('Error al registrar usuario:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar el usuario',
        details: error?.errors || null
      });
    }
  };
}