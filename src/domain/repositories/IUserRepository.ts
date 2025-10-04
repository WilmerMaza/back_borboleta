import { IUser } from "../entities/User";

export interface IUserRepository {
  create(user: IUser): Promise<IUser>;
  findById(id: number): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByPhone(phone: string, countryCode: number): Promise<IUser | null>;
  findAll(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    field?: string;
    sort?: string;
  }): Promise<IUser[]>;
  update(id: number, user: Partial<IUser>): Promise<IUser | null>;
  updatePassword(email: string, password: string): Promise<IUser | null>;
  delete(id: number): Promise<boolean>;
}