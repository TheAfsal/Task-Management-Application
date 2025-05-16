import { Document } from "mongoose";
import { IBaseRepository } from "./baseRepo.interface";
import { Request, Response } from "express";

interface ITask extends Document {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  groupId: string;
  createdBy: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ITaskRepository extends IBaseRepository<ITask> {
  findTasksByGroupIds(
    groupIds: string[],
    search?: string,
    skip?: number,
    limit?: number
  ): Promise<ITask[]>;
  countTasksByGroupIds(groupIds: string[], search?: string): Promise<number>;
  getTaskStatistics(
    userId: string,
    groupIds: string[]
  ): Promise<{
    completed: number;
    incomplete: number;
    overdueByGroup: Array<{
      groupId: string;
      groupName: string;
      count: number;
    }>;
  }>;
}

interface ITaskService {
  createTask(input: {
    title: string;
    description?: string;
    groupId: string;
    assignee?: string;
    userId: string;
  }): Promise<ITask>;
  getTasks(
    userId: string,
    groupId?: string,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{
    tasks: ITask[];
    totalPages: number;
    currentPage: number;
  }>;
  updateTask(
    id: string,
    input: {
      title?: string;
      description?: string;
      groupId?: string;
      assignee?: string;
      completed?: boolean;
      userId: string;
    }
  ): Promise<ITask | null>;
  deleteTask(id: string, userId: string): Promise<boolean>;
  getTaskStatistics(userId: string): Promise<{
    completed: number;
    incomplete: number;
    overdueByGroup: Array<{
      groupId: string;
      groupName: string;
      count: number;
    }>;
  }>;
}

interface ITaskController {
  createTask(req: Request, res: Response): Promise<void>;
  getTasks(req: Request, res: Response): Promise<void>;
  updateTask(req: Request, res: Response): Promise<void>;
  deleteTask(req: Request, res: Response): Promise<void>;
  getTaskStatistics(req: Request, res: Response): Promise<void>;
}

export { ITask, ITaskRepository, ITaskService, ITaskController };
