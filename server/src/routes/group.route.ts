import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  joinGroup,
} from "../controllers/groups.controller";

const router = Router();

router.post("/", authenticateToken, createGroup);
router.get("/", authenticateToken, getGroups);
router.put("/:id", authenticateToken, updateGroup);
router.delete("/:id", authenticateToken, deleteGroup);
router.post("/join", authenticateToken, joinGroup);

export default router;