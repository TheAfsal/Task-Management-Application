import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { sendInvite } from "../controllers/invites.controller";

const router = Router();

router.post("/", authenticateToken, sendInvite);

export default router;
