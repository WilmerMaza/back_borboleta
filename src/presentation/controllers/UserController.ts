import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { RegisterUserCommand } from "../../application/commands/user/RegisterUserCommand";
import { RegisterUserHandler } from "../../application/command-handlers/user/RegisterUserHandler";
import { LoginCommand } from "../../application/commands/user/LoginCommand";
import { LoginHandler } from "../../application/command-handlers/user/LoginHandler";
import { LoginPhoneCommand } from "../../application/commands/user/LoginPhoneCommand";
import { LoginPhoneHandler } from "../../application/command-handlers/user/LoginPhoneHandler";
import { VerifyEmailOTPCommand } from "../../application/commands/user/VerifyEmailOTPCommand";
import { VerifyEmailOTPHandler } from "../../application/command-handlers/user/VerifyEmailOTPHandler";
import { VerifyPhoneOTPCommand } from "../../application/commands/user/VerifyPhoneOTPCommand";
import { VerifyPhoneOTPHandler } from "../../application/command-handlers/user/VerifyPhoneOTPHandler";
import { ForgotPasswordCommand } from "../../application/commands/user/ForgotPasswordCommand";
import { ForgotPasswordHandler } from "../../application/command-handlers/user/ForgotPasswordHandler";
import { UpdatePasswordCommand } from "../../application/commands/user/UpdatePasswordCommand";
import { UpdatePasswordHandler } from "../../application/command-handlers/user/UpdatePasswordHandler";
import { GetUserProfileQuery } from "../../application/queries/user/GetUserProfileQuery";
import { GetUserProfileHandler } from "../../application/query-handlers/user/GetUserProfileHandler";
import { AuthenticatedRequest } from "../../middleware/auth";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { container } from "tsyringe";
import { UserRepository } from "src/infrastructure/repositories/UserRepository";

@injectable()
export class UserController {
  constructor(
    @inject("RegisterUserHandler")
    private registerUserHandler: RegisterUserHandler,
    @inject("LoginHandler") private loginHandler: LoginHandler,
    @inject("LoginPhoneHandler") private loginPhoneHandler: LoginPhoneHandler,
    @inject("VerifyEmailOTPHandler")
    private verifyEmailOTPHandler: VerifyEmailOTPHandler,
    @inject("VerifyPhoneOTPHandler")
    private verifyPhoneOTPHandler: VerifyPhoneOTPHandler,
    @inject("ForgotPasswordHandler")
    private forgotPasswordHandler: ForgotPasswordHandler,
    @inject("UpdatePasswordHandler")
    private updatePasswordHandler: UpdatePasswordHandler,
    @inject("GetUserProfileHandler")
    private getUserProfileHandler: GetUserProfileHandler
  ) {}

  handleRegisterUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const command = new RegisterUserCommand(req.body);
      const user = await this.registerUserHandler.handle(command);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error al registrar el usuario",
        details: error?.errors || null,
      });
    }
  };

  handleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const command = new LoginCommand(req.body.email, req.body.password);
      const result = await this.loginHandler.handle(command);

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Error al hacer login",
      });
    }
  };

  handleLoginPhone = async (req: Request, res: Response): Promise<void> => {
    try {
      const command = new LoginPhoneCommand(
        req.body.phone,
        req.body.country_code
      );
      const result = await this.loginPhoneHandler.handle(command);

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Error al hacer login",
      });
    }
  };

  handleVerifyEmailOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const command = new VerifyEmailOTPCommand(req.body.email, req.body.token);
      const result = await this.verifyEmailOTPHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error al verificar OTP",
      });
    }
  };

  handleVerifyPhoneOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const command = new VerifyPhoneOTPCommand(
        req.body.phone,
        req.body.country_code,
        req.body.token
      );
      const result = await this.verifyPhoneOTPHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error al verificar OTP",
      });
    }
  };

  handleForgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const command = new ForgotPasswordCommand(req.body.email);
      const result = await this.forgotPasswordHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error al procesar solicitud",
      });
    }
  };

  handleUpdatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const command = new UpdatePasswordCommand(
        req.body.email,
        req.body.token,
        req.body.password,
        req.body.password_confirmation
      );
      const result = await this.updatePasswordHandler.handle(command);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Error al actualizar contraseña",
      });
    }
  };

  handleGetUserProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const userRepository =
        container.resolve<IUserRepository>("UserRepository");
      const query = new GetUserProfileQuery(req.user.userId, userRepository);
      const user = await this.getUserProfileHandler.handle(query);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Perfil obtenido exitosamente",
        data: {
          user: user,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener perfil",
      });
    }
  };

  handleTestToken = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Token válido",
        data: {
          user: req.user,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al verificar token",
      });
    }
  };

  // GET /api/users - Listar todos los usuarios
  handleGetUsers = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const userRepository =
        container.resolve<IUserRepository>("UserRepository");
      const users = await userRepository.findAll();

      // Formatear respuesta (sin contraseñas)
      const formattedUsers = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.status(200).json({
        success: true,
        message: "Usuarios obtenidos exitosamente",
        data: {
          users: formattedUsers,
          total: formattedUsers.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al obtener usuarios",
      });
    }
  };

  // PUT /api/users/:id - Actualizar usuario
  handleUpdateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const userRepository =
        container.resolve<IUserRepository>("UserRepository");

      // Verificar que el usuario existe
      const existingUser = await userRepository.findById(parseInt(id));
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
        return;
      }

      // Validar que no se esté actualizando el email a uno que ya existe
      if (updateData.email && updateData.email !== existingUser.email) {
        const userWithEmail = await userRepository.findByEmail(
          updateData.email
        );
        if (userWithEmail && userWithEmail.id !== parseInt(id)) {
          res.status(400).json({
            success: false,
            message: "El email ya está en uso por otro usuario",
          });
          return;
        }
      }

      // Actualizar usuario
      const updatedUser = await userRepository.update(parseInt(id), updateData);

      if (!updatedUser) {
        res.status(500).json({
          success: false,
          message: "Error al actualizar el usuario",
        });
        return;
      }

      // Formatear respuesta (sin contraseña)
      const { password, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al actualizar usuario",
      });
    }
  };

  // DELETE /api/users/:id - Eliminar usuario administrativo (solo AdminUser)
  handleDeleteUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const adminUserRepository = container.resolve<UserRepository>(
        "AdminUserRepository"
      );

      // Verificar que no se esté eliminando a sí mismo
      if (parseInt(id) === req.user.userId) {
        res.status(400).json({
          success: false,
          message: "No puedes eliminar tu propia cuenta",
        });
        return;
      }

      // Buscar el usuario administrativo
      const existingAdminUser = await adminUserRepository.findById(
        parseInt(id)
      );
      if (!existingAdminUser) {
        res.status(404).json({
          success: false,
          message: "Usuario administrativo no encontrado",
        });
        return;
      }

      // Eliminar usuario administrativo
      const deleted = await adminUserRepository.delete(parseInt(id));

      if (!deleted) {
        res.status(500).json({
          success: false,
          message: "Error al eliminar el usuario administrativo",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Usuario administrativo eliminado exitosamente",
        details: {
          deletedUserId: id,
          deletedUserEmail: existingAdminUser.email,
          deletedUserName: existingAdminUser.name,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Error al eliminar usuario administrativo",
      });
    }
  };
}
