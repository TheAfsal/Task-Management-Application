import UserModel from '../models/User.model';
import { IAuthRepository, IUser } from '../interfaces/auth.interface';
import BaseRepository from './base.repo';

export class AuthRepository extends BaseRepository<IUser> implements IAuthRepository {
  constructor() {
    super(UserModel);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async createUser(userData: { username: string; email: string; password: string }): Promise<IUser> {
    return this.save(userData);
  }

  async findUserById(id: string): Promise<IUser | null> {
    return this.findById(id);
  }
}