import { Document } from "mongoose";
import { IBaseRepository } from "./baseRepo.interface";
import { Request, Response } from "express";

interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
}

interface IAuthRepository extends IBaseRepository<IUser> {
  findUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<IUser>;
  findUserById(id: string): Promise<IUser | null>;
}

interface IAuthService {
  register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{
    accessToken: string;
    user: { email: string; _id: string };
    refreshToken: string;
  }>;
  login(credentials: { email: string; password: string }): Promise<{
    accessToken: string;
    user: { email: string; _id: string };
    refreshToken: string;
  }>;
  refresh(
    refreshToken: string
  ): Promise<{ accessToken: string; user: { email: string; _id: string } }>;
  logout(refreshToken: string): Promise<void>;
}

interface IAuthController {
  register(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  refresh(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

export { IUser, IAuthRepository, IAuthService, IAuthController };
