import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { RegisterUserCommand } from '../../application/commands/user/RegisterUserCommand';
import { RegisterUserHandler } from '../../application/command-handlers/user/RegisterUserHandler';
import { LoginCommand } from '../../application/commands/user/LoginCommand';
import { LoginHandler } from '../../application/command-handlers/user/LoginHandler';
import { LoginPhoneCommand } from '../../application/commands/user/LoginPhoneCommand';
import { LoginPhoneHandler } from '../../application/command-handlers/user/LoginPhoneHandler';
import { VerifyEmailOTPCommand } from '../../application/commands/user/VerifyEmailOTPCommand';
import { VerifyEmailOTPHandler } from '../../application/command-handlers/user/VerifyEmailOTPHandler';
import { VerifyPhoneOTPCommand } from '../../application/commands/user/VerifyPhoneOTPCommand';
import { VerifyPhoneOTPHandler } from '../../application/command-handlers/user/VerifyPhoneOTPHandler';
import { ForgotPasswordCommand } from '../../application/commands/user/ForgotPasswordCommand';
import { ForgotPasswordHandler } from '../../application/command-handlers/user/ForgotPasswordHandler';
import { UpdatePasswordCommand } from '../../application/commands/user/UpdatePasswordCommand';
import { UpdatePasswordHandler } from '../../application/command-handlers/user/UpdatePasswordHandler';
import { GetUserProfileQuery } from '../../application/queries/user/GetUserProfileQuery';
import { GetUserProfileHandler } from '../../application/query-handlers/user/GetUserProfileHandler';
import { Logger } from '../../shared/utils/logger';
import { AuthenticatedRequest } from '../../middleware/auth';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { container } from 'tsyringe';

@injectable()
export class UserController {
  constructor(
    @inject("RegisterUserHandler") private registerUserHandler: RegisterUserHandler,
    @inject("LoginHandler") private loginHandler: LoginHandler,
    @inject("LoginPhoneHandler") private loginPhoneHandler: LoginPhoneHandler,
    @inject("VerifyEmailOTPHandler") private verifyEmailOTPHandler: VerifyEmailOTPHandler,
    @inject("VerifyPhoneOTPHandler") private verifyPhoneOTPHandler: VerifyPhoneOTPHandler,
    @inject("ForgotPasswordHandler") private forgotPasswordHandler: ForgotPasswordHandler,
    @inject("UpdatePasswordHandler") private updatePasswordHandler: UpdatePasswordHandler,
    @inject("GetUserProfileHandler") private getUserProfileHandler: GetUserProfileHandler
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

  handleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de login recibida', req.body);
      
      const command = new LoginCommand(req.body.email, req.body.password);
      const result = await this.loginHandler.handle(command);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error: any) {
      Logger.error('Error al hacer login:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Error al hacer login'
      });
    }
  };

  handleLoginPhone = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de login por teléfono recibida', req.body);
      
      const command = new LoginPhoneCommand(req.body.phone, req.body.country_code);
      const result = await this.loginPhoneHandler.handle(command);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error: any) {
      Logger.error('Error al hacer login por teléfono:', error);

      res.status(401).json({
        success: false,
        message: error.message || 'Error al hacer login'
      });
    }
  };

  handleVerifyEmailOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de verificación de OTP por email recibida', req.body);
      
      const command = new VerifyEmailOTPCommand(req.body.email, req.body.token);
      const result = await this.verifyEmailOTPHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error('Error al verificar OTP por email:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al verificar OTP'
      });
    }
  };

  handleVerifyPhoneOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de verificación de OTP por teléfono recibida', req.body);
      
      const command = new VerifyPhoneOTPCommand(req.body.phone, req.body.country_code, req.body.token);
      const result = await this.verifyPhoneOTPHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error('Error al verificar OTP por teléfono:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al verificar OTP'
      });
    }
  };

  handleForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de recuperación de contraseña recibida', req.body);
      
      const command = new ForgotPasswordCommand(req.body.email);
      const result = await this.forgotPasswordHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error('Error al procesar recuperación de contraseña:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al procesar solicitud'
      });
    }
  };

  handleUpdatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de actualización de contraseña recibida', req.body);
      
      const command = new UpdatePasswordCommand(
        req.body.email,
        req.body.token,
        req.body.password,
        req.body.password_confirmation
      );
      const result = await this.updatePasswordHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error('Error al actualizar contraseña:', error);

      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar contraseña'
      });
    }
  };

  handleGetUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de perfil de usuario recibida', req.user);
      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const userRepository = container.resolve<IUserRepository>('UserRepository');
      const query = new GetUserProfileQuery(req.user.userId, userRepository);
      const user = await this.getUserProfileHandler.handle(query);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          user: user
        }
      });
    } catch (error: any) {
      Logger.error('Error al obtener perfil de usuario:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener perfil'
      });
    }
  };

  handleTestToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      Logger.log('Solicitud de prueba de token recibida', req.user);
      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user
        }
      });
    } catch (error: any) {
      Logger.error('Error en prueba de token:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error al verificar token'
      });
    }
  };
}