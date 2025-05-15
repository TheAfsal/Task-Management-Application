import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { STATUS_CODE } from "../constants/statusCode";
import { loginSchema, userSchema } from "../validations/userSchema";
import { IAuthController, IAuthService } from "interfaces/auth.interface";

export default class AuthController implements IAuthController {
  constructor(private authService: IAuthService) {}

  register = async (req: Request, res: Response) => {
    try {
      const validatedData = userSchema.parse(req.body);

      const { accessToken, user, refreshToken } =
        await this.authService.register(validatedData);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(STATUS_CODE.Created).json({ accessToken, user });
    } catch (error: any) {
      res.status(STATUS_CODE.Internal_Server_Error).json({
        error: "Validation failed",
        details: error.message,
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const { accessToken, user, refreshToken } = await this.authService.login(
        validatedData
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken, user });
    } catch (error: any) {
      res.status(STATUS_CODE.Unauthorized).json({
        error: "Invalid credentials",
        details: error.message,
      });
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await this.authService.refresh(refreshToken);
      res.json(result);
    } catch (error: any) {
      res.status(STATUS_CODE.Forbidden).json({
        error: "Invalid refresh token",
        details: error.message,
      });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      await this.authService.logout(refreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none" as const,
      });

      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(STATUS_CODE.Internal_Server_Error).json({
        error: "Logout failed",
        details: error.message,
      });
    }
  };
}

// export const register = async (req: Request, res: Response) => {
//   try {
//     const validatedData = userSchema.parse(req.body);
//     const { name, email, password } = validatedData;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       res
//         .status(STATUS_CODE.Bad_Request)
//         .json({ error: "Email already exists" });
//       return;
//     }

//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const user = new User({ username: name, email, password: hashedPassword });
//     await user.save();

//     const accessToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "1h" }
//     );
//     const refreshToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "7d" }
//     );

//     await user.save();

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res
//       .status(STATUS_CODE.Created)
//       .json({ accessToken, user: { email: user.email, _id: user._id } });
//   } catch (error: any) {
//     res
//       .status(STATUS_CODE.Internal_Server_Error)
//       .json({
//         error: "Validation failed",
//         details: error.errors ?? error,
//       });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   try {
//     const validatedData = loginSchema.parse(req.body);
//     const { email, password } = validatedData;

//     const user = await User.findOne({ email });
//     if (!user) {
//       res
//         .status(STATUS_CODE.Unauthorized)
//         .json({ error: "Invalid credentials" });
//       return;
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       res
//         .status(STATUS_CODE.Unauthorized)
//         .json({ error: "Invalid credentials" });
//       return;
//     }

//     const accessToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "1h" }
//     );
//     const refreshToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "7d" }
//     );

//     await user.save();

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.json({ accessToken, user: { email: user.email, _id: user._id } });
//   } catch (error: any) {
//     res
//       .status(STATUS_CODE.Internal_Server_Error)
//       .json({
//         error: "Validation failed",
//         details: error.errors ?? error,
//       });
//   }
// };

// export const refresh = async (req: Request, res: Response) => {
//   const refreshToken = req.cookies.refreshToken;
//   if (!refreshToken) {
//     res
//       .status(STATUS_CODE.Unauthorized)
//       .json({ error: "No refresh token provided" });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
//       userId: string;
//     };
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       res
//         .status(STATUS_CODE.Forbidden)
//         .json({ error: "Invalid refresh token" });
//       return;
//     }

//     const accessToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET!,
//       { expiresIn: "1h" }
//     );
//     res.json({ accessToken, user: { email: user.email, _id: user._id } });
//   } catch (error: any) {
//     res
//       .status(STATUS_CODE.Forbidden)
//       .json({ error: "Invalid refresh token", details: error.message });
//   }
// };

// export const logout = async (req: Request, res: Response) => {
//   const refreshToken = req.cookies.refreshToken;
//   if (refreshToken) {
//     const user = await User.findOne({ refreshToken });
//     if (user) {
//       await user.save();
//     }
//   }

//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "none",
//   });

//   res.json({ message: "Logged out successfully" });
// };
