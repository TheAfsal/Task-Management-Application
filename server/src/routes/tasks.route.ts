import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller";

const router = Router();

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

export default router;