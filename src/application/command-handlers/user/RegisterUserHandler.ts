import { injectable, inject } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { AuthService } from "../../services/AuthService";
import { RegisterUserCommand } from "../../commands/user/RegisterUserCommand";

@injectable()
export class RegisterUserHandler {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("AuthService") private authService: AuthService
  ) {}

  async handle(command: RegisterUserCommand): Promise<any> {
    try {
      const userData = command.data;

      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );

      if (existingUser) {
        throw new Error("El email ya está registrado");
      }

      // Hash de la contraseña
      const hashedPassword = await this.authService.hashPassword(
        userData.password
      );

      // Crear usuario con rol "consumer" (cliente) por defecto
      const newUserData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        country_code: userData.country_code,
        role_id: 2, // ID del rol "consumer" (cliente)
        status: true,
        email_verified_at: undefined,
        is_approved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const user = await this.userRepository.create(newUserData);

      // Preparar respuesta del usuario (sin contraseña)

      return {
        email: user.email,
        number: {
          phone: user.phone,
          country_code: user.country_code,
        },
        token: "",
        role_name: "consumer",
        role_slug: "consumer",
        access_token: this.authService.generateToken(user.id!, user.email),
        permissions: [],
      };
    } catch (error: any) {
      throw error;
    }
  }
}
