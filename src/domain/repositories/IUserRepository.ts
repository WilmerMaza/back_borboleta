import { IUser } from "../entities/User";

export interface IUserRepository {
  create(user: IUser): Promise<IUser>;
  findById(id: number): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  update(id: number, user: Partial<IUser>): Promise<IUser | null>;
  delete(id: number): Promise<boolean>;
}