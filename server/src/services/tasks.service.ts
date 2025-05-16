import { Types } from "mongoose";
import GroupModel from "../models/Group.model";
import UserModel from "../models/User.model";
import {
  ITask,
  ITaskService,
  ITaskRepository,
} from "../interfaces/task.interface";
import { taskSchema } from "../validations/taskSchema";
import { emitTaskCreated, emitTaskUpdated, emitTaskDeleted } from "../socket";

export class TaskService implements ITaskService {
  constructor(private taskRepository: ITaskRepository) {}

  async createTask(input: {
    title: string;
    description?: string;
    groupId: string;
    assignee?: string;
    userId: string;
  }): Promise<ITask> {
    
    const validatedData = taskSchema.parse(input);
    const { title, description, groupId, assignee } = validatedData;

    console.log(title, description, groupId, assignee );
    
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    console.log(group.members);

    if (!group.members.includes(input.userId)) {
      throw new Error("User not authorized to create tasks in this group");
    }

    if (assignee) {
      const user = await UserModel.findById(assignee);
      if (!user || !group.members.includes(assignee)) {
        throw new Error("Assignee not found or not in group");
      }
    }

    const task = await this.taskRepository.save({
      title,
      description,
      groupId,
      assignee,
      createdBy: input.userId,
      completed: false,
    });

    const savedTask = this.transformTask(task);
    //@ts-ignore
    emitTaskCreated(savedTask);
    return savedTask;
  }

  async getTasks(
    userId: string,
    groupId?: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    tasks: ITask[];
    totalPages: number;
    currentPage: number;
  }> {
    const groups = await GroupModel.find({
      $or: [{ leader: userId }, { members: userId }],
    });
    //@ts-ignore
    const groupIds = groups.map((g) => g._id.toString());
    const queryGroupIds = groupId ? [groupId] : groupIds;

    const skip = (page - 1) * limit;
    const tasks = await this.taskRepository.findTasksByGroupIds(
      queryGroupIds,
      search,
      skip,
      limit
    );
    const totalTasks = await this.taskRepository.countTasksByGroupIds(
      queryGroupIds,
      search
    );
    const totalPages = Math.ceil(totalTasks / limit);

    return {
      tasks: tasks.map((task) => this.transformTask(task)),
      totalPages,
      currentPage: page,
    };
  }

  async updateTask(
    id: string,
    input: {
      title?: string;
      description?: string;
      groupId?: string;
      assignee?: string;
      completed?: boolean;
      userId: string;
    }
  ): Promise<ITask | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid task ID");
    }

    const task = await this.taskRepository.findById(id);
    if (!task) {
      return null;
    }

    const group = await GroupModel.findById(task.groupId);
    if (
      !group ||
      (!group.members.includes(input.userId) && group.leader !== input.userId)
    ) {
      throw new Error("User not authorized to update this task");
    }

    if (input.groupId && input.groupId !== task.groupId) {
      const newGroup = await GroupModel.findById(input.groupId);
      if (!newGroup) {
        throw new Error("Target group not found");
      }
      if (
        !newGroup.members.includes(input.userId) &&
        newGroup.leader !== input.userId
      ) {
        throw new Error("User not authorized to move task to this group");
      }
    }

    if (input.assignee) {
      const user = await UserModel.findById(input.assignee);
      if (!user || !group.members.includes(input.assignee)) {
        throw new Error("Assignee not found or not in group");
      }
    }

    const updates: Partial<ITask> = {};
    if (input.title) updates.title = input.title;
    if (input.description !== undefined)
      updates.description = input.description;
    if (input.groupId) updates.groupId = input.groupId;
    if (input.assignee !== undefined) updates.assignee = input.assignee;
    if (input.completed !== undefined) updates.completed = input.completed;

    const updatedTask = await this.taskRepository.findByIdAndUpdate(
      id,
      updates
    );
    if (updatedTask) {
      const transformedTask = this.transformTask(updatedTask);
      //@ts-ignore
      emitTaskUpdated(transformedTask);
      return transformedTask;
    }
    return null;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid task ID");
    }

    const task = await this.taskRepository.findById(id);
    if (!task) {
      return false;
    }

    const group = await GroupModel.findById(task.groupId);
    if (
      !group ||
      (!group.members.includes(userId) && group.leader !== userId)
    ) {
      throw new Error("User not authorized to delete this task");
    }

    //@ts-ignore
    const deleted = await this.taskRepository.delete(id);
    if (deleted) {
      emitTaskDeleted(id, task.groupId);
    }
    return deleted;
  }

  async getTaskStatistics(userId: string): Promise<{
    completed: number;
    incomplete: number;
    overdueByGroup: Array<{
      groupId: string;
      groupName: string;
      count: number;
    }>;
  }> {
    const groups = await GroupModel.find({ members: userId }).select(
      "_id name"
    );
    //@ts-ignore
    const groupIds = groups.map((g) => g._id.toString());
    return this.taskRepository.getTaskStatistics(userId, groupIds);
  }

  private transformTask(task: ITask): ITask {
    const transformed = task.toObject({
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        if (ret.assignee && typeof ret.assignee === "object") {
          ret.assignee._id = ret.assignee._id.toString();
        }
        return ret;
      },
    });
    return transformed as ITask;
  }
}
