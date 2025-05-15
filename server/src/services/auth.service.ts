import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IAuthService, IUser } from '../interfaces/auth.interface';
import { IAuthRepository } from '../interfaces/auth.interface';
import { userSchema, loginSchema } from '../validations/userSchema';
import { STATUS_CODE } from '../constants/statusCode';

export class AuthService implements IAuthService {
  constructor(private authRepository: IAuthRepository) {}

  async register(userData: { name: string; email: string; password: string }) {
    try {
      const validatedData = userSchema.parse(userData);
      const { name, email, password } = validatedData;

      const existingUser = await this.authRepository.findUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await this.authRepository.createUser({
        username: name,
        email,
        password: hashedPassword,
      });

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return {
        accessToken,
        user: { email: user.email, _id: user._id },
        refreshToken,
      };
    } catch (error: any) {
        console.log(error);
        
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      const validatedData = loginSchema.parse(credentials);
      const { email, password } = validatedData;

      const user = await this.authRepository.findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return {
        accessToken,
        user: { email: user.email, _id: user._id },
        refreshToken,
      };
    } catch (error: any) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await this.authRepository.findUserById(decoded.userId);

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      return {
        accessToken,
        user: { email: user.email, _id: user._id },
      };
    } catch (error: any) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const user = await this.authRepository.findOne({ refreshToken });
    //   if (user) {
    //     await this.authRepository.update(user._id, { refreshToken: undefined });
    //   }
    }
  }
}