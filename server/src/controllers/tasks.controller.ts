import { Request, Response } from "express";
import { STATUS_CODE } from "../constants/statusCode";
import { TaskService } from "../services/tasks.service";
import { ITaskController } from "interfaces/task.interface";

export class TaskController implements ITaskController {
  constructor(private taskService: TaskService) {}

  createTask = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(STATUS_CODE.Unauthorized)
          .json({ error: "User not authenticated" });
        return;
      }
      const task = await this.taskService.createTask({ ...req.body, userId });
      res.status(STATUS_CODE.Created).json(task);
    } catch (error: any) {
      console.log(error);
      
      res.status(STATUS_CODE.Bad_Request).json({ error: error.message });
    }
  }

  getTasks = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODE.Unauthorized).json({ error: "Unauthorized" });
        return;
      }
      const { groupId, page = "1", limit = "10", search } = req.query;
      const tasks = await this.taskService.getTasks(
        userId,
        groupId as string | undefined,
        parseInt(page as string, 10),
        parseInt(limit as string, 10),
        search as string | undefined
      );
      res.json(tasks);
    } catch (error: any) {
      res.status(STATUS_CODE.Bad_Request).json({ error: error.message });
    }
  }

  updateTask = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(STATUS_CODE.Unauthorized)
          .json({ error: "User not authenticated" });
        return;
      }
      const task = await this.taskService.updateTask(id, {
        ...req.body,
        userId,
      });
      if (!task) {
        res.status(STATUS_CODE.Not_Found).json({ error: "Task not found" });
        return;
      }
      res.json(task);
    } catch (error: any) {
      res.status(STATUS_CODE.Bad_Request).json({ error: error.message });
    }
  }

  deleteTask = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        res
          .status(STATUS_CODE.Unauthorized)
          .json({ error: "User not authenticated" });
        return;
      }
      const deleted = await this.taskService.deleteTask(id, userId);
      if (!deleted) {
        res.status(STATUS_CODE.Not_Found).json({ error: "Task not found" });
        return;
      }
      res.status(STATUS_CODE.No_Content).send();
    } catch (error: any) {
      res.status(STATUS_CODE.Bad_Request).json({ error: error.message });
    }
  }

  getTaskStatistics = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODE.Unauthorized).json({ message: "Unauthorized" });
        return;
      }
      const statistics = await this.taskService.getTaskStatistics(userId);
      res.json(statistics);
    } catch (error: any) {
      res
        .status(STATUS_CODE.Internal_Server_Error)
        .json({ message: "Server error" });
    }
  }
}
