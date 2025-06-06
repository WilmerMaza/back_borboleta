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
      const user = await UserModel.findOne({ email });
      return user ? user.toObject() : null;
    } catch (error) {
      Logger.error(`Error al buscar usuario con email ${email}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<IUser[]> {
    try {
      const users = await UserModel.find();
      return users.map(user => user.toObject());
    } catch (error) {
      Logger.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }

  async update(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true }
      );
      return updatedUser ? updatedUser.toObject() : null;
    } catch (error) {
      Logger.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      Logger.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }
}