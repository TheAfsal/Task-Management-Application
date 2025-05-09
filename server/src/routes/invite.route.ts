import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { acceptInvite, getPendingInvites, rejectInvite, sendInvite } from "../controllers/invites.controller";

const router = Router();

router.post("/", authenticateToken, sendInvite);
router.get("/pending", authenticateToken, getPendingInvites);
router.post("/accept/:inviteId", authenticateToken, acceptInvite);
router.post("/reject/:inviteId", authenticateToken, rejectInvite);

export default router;
