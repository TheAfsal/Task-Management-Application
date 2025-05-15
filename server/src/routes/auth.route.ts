import AuthController from "../controllers/auth.controller";
import { Router } from "express";
import { AuthRepository } from "../repositories/auth.repo";
import { AuthService } from "../services/auth.service";

const router = Router();
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
