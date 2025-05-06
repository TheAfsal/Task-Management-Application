import { Router, Request, Response } from "express";
import Task from "../models/Task";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed,
  });
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    if (req.body.title != null) task.title = req.body.title;
    if (req.body.description != null) task.description = req.body.description;
    if (req.body.completed != null) task.completed = req.body.completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
