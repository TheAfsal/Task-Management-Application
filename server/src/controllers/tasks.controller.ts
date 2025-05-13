import { Request, Response } from "express";
import * as taskService from "../services/tasks.service";
import { Types } from "mongoose";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, groupId, assignee } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const task = await taskService.createTask({
      title,
      description,
      groupId,
      assignee,
      userId,
    });

    res.status(201).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { groupId, page = "1", limit = "10",search } = req.query;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    const tasks = await taskService.getTasksService(
      userId,
      groupId as string | undefined,
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      search as string | undefined
    );
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, groupId, assignee, completed } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const task = await taskService.updateTask(id, {
      title,
      description,
      groupId,
      assignee,
      completed,
      userId,
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const deleted = await taskService.deleteTask(id, userId);

    if (!deleted) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getTaskStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const statistics = await taskService.getTaskStatistics(userId);
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
