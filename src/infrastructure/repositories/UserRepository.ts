import { injectable } from 'tsyringe';

import { Logger } from '../../shared/utils/logger';
import { IUserRepository } from 'src/domain/repositories/IUserRepository';
import { IUser } from 'src/domain/entities/User';
import UserModel from '../database/models/UserModel';

@injectable()
export class UserRepository implements IUserRepository {
  async create(user: IUser): Promise<IUser> {
    try {
      console.log('Datos recibidos para crear usuario:', JSON.stringify(user, null, 2));
      const newUser = new UserModel(user);
      console.log('Modelo de usuario creado:', JSON.stringify(newUser, null, 2));
      const savedUser = await newUser.save();
      console.log('Usuario guardado en la base de datos:', JSON.stringify(savedUser, null, 2));
      return savedUser.toObject();
    } catch (error) {
      console.error('Error al crear usuario en la base de datos:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ id: id });
      return user ? user.toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar usuario con ID ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      Logger.log(`🔍 UserRepository: Buscando usuario con email: "${email}"`);
      const user = await UserModel.findOne({ email });
      Logger.log(`🔍 UserRepository: Resultado de búsqueda:`, user ? `Usuario encontrado: ${user.email}` : 'Usuario no encontrado');
      
      if (user) {
        Logger.log(`🔍 UserRepository: Detalles del usuario:`, {
          id: user.id,
          email: user.email,
          name: user.name
        });
      }
      
      return user ? user.toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar usuario con email ${email}:`, error);
      throw error;
    }
  }

  async findByPhone(phone: string, countryCode: number): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ phone, country_code: countryCode });
      return user ? user.toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar usuario con teléfono ${phone}:`, error);
      throw error;
    }
  }

  async findAll(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    field?: string;
    sort?: string;
  }): Promise<IUser[]> {
    try {
      let query = UserModel.find({ status: true });
      
      // Aplicar búsqueda si se especifica
      if (params?.search) {
        query = query.find({
          $or: [
            { name: { $regex: params.search, $options: 'i' } },
            { email: { $regex: params.search, $options: 'i' } }
          ]
        });
      }
      
      // Aplicar ordenamiento si se especifica
      if (params?.sort) {
        const sortDirection = params.sort.startsWith('-') ? -1 : 1;
        const sortField = params.sort.startsWith('-') ? params.sort.substring(1) : params.sort;
        query = query.sort({ [sortField]: sortDirection });
      }
      
      // Aplicar paginación si se especifica
      if (params?.skip) {
        query = query.skip(params.skip);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      
      const users = await query.exec();
      return users.map(user => user.toObject());
    } catch (error) {
      Logger.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }

  async update(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { id: id },
        { $set: userData },
        { new: true }
      );
      return updatedUser ? updatedUser.toObject() : null;
    } catch (error) {
      Logger.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  }

  async updatePassword(email: string, password: string): Promise<IUser | null> {
    try {
      const bcrypt = require('bcryptjs');
      const { authConfig } = require('../../config/auth');
      const hashedPassword = await bcrypt.hash(password, authConfig.BCRYPT_SALT_ROUNDS);
      
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { $set: { password: hashedPassword } },
        { new: true }
      );
      return updatedUser ? updatedUser.toObject() : null;
    } catch (error) {
      Logger.error(`Error al actualizar contraseña para email ${email}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await UserModel.findOneAndDelete({ id: id });
      return !!result;
    } catch (error) {
      Logger.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }
}