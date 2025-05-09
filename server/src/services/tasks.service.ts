import TaskModel from "../models/Task.model";
import GroupModel from "../models/Group.model";
import UserModel from "../models/User.model";
import { emitTaskCreated, emitTaskUpdated, emitTaskDeleted } from "../socket";
import type { Task } from "../types/task.types";

interface CreateTaskInput {
  title: string;
  description?: string;
  groupId: string;
  assignee?: string;
  userId: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  groupId?: string;
  assignee?: string;
  completed?: boolean;
  userId: string;
}

export const createTask = async ({
  title,
  description,
  groupId,
  assignee,
  userId,
}: CreateTaskInput): Promise<Task> => {
  console.log(title, description, groupId, assignee, userId);

  const group = await GroupModel.findById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  if (!group.members.includes(userId) && group.leader !== userId) {
    throw new Error("User not authorized to create tasks in this group");
  }

  if (assignee) {
    const user = await UserModel.findById(assignee);
    if (!user || !group.members.includes(assignee)) {
      throw new Error("Assignee not found or not in group");
    }
  }

  const task = new TaskModel({
    title,
    description,
    groupId,
    assignee,
    completed: false,
  });

  await task.save();
  const savedTask = task.toObject({
    transform: (doc, ret) => {
      ret._id = ret._id.toString();
      delete ret.__v;
      if (ret.assignee && typeof ret.assignee === "object") {
        ret.assignee._id = ret.assignee._id.toString();
      }
      return ret;
    },
  });

  emitTaskCreated(savedTask);
  return savedTask;
};

export const getTasks = async (
  userId: string,
  groupId?: string
): Promise<Task[]> => {
  const query: any = groupId ? { groupId } : {};

  const groups = await GroupModel.find({
    $or: [{ leader: userId }, { members: userId }],
  });

  //@ts-ignore
  const groupIds = groups.map((g) => g._id.toString());
  query.groupId = groupId ? groupId : { $in: groupIds };

  const tasks = await TaskModel.find(query).populate(
    "assignee",
    "_id email username"
  );

  return tasks.map((t) =>
    t.toObject({
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        if (ret.assignee && typeof ret.assignee === "object") {
          ret.assignee._id = ret.assignee._id.toString();
        }
        return ret;
      },
    })
  );
};

export const getTasksService = async (
  userId: string,
  groupId?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ tasks: Task[]; totalPages: number; currentPage: number }> => {
  const query: any = groupId ? { groupId } : {};

  const groups = await GroupModel.find({
    $or: [{ leader: userId }, { members: userId }],
  });

  //@ts-ignore
  const groupIds = groups.map((g) => g._id.toString());
  query.groupId = groupId ? groupId : { $in: groupIds };

  const totalTasks = await TaskModel.countDocuments(query);
  const totalPages = Math.ceil(totalTasks / limit);
  const skip = (page - 1) * limit;

  const tasks = await TaskModel.find(query)
    .populate("assignee", "_id email username")
    .skip(skip)
    .limit(limit);

  return {
    tasks: tasks.map((t) =>
      t.toObject({
        transform: (doc, ret) => {
          ret._id = ret._id.toString();
          delete ret.__v;
          if (ret.assignee && typeof ret.assignee === "object") {
            ret.assignee._id = ret.assignee._id.toString();
          }
          return ret;
        },
      })
    ),
    totalPages,
    currentPage: page,
  };
};

export const updateTask = async (
  id: string,
  { title, description, groupId, assignee, completed, userId }: UpdateTaskInput
): Promise<Task | null> => {
  const task = await TaskModel.findById(id);
  if (!task) {
    return null;
  }

  const group = await GroupModel.findById(task.groupId);
  if (!group || (!group.members.includes(userId) && group.leader !== userId)) {
    throw new Error("User not authorized to update this task");
  }

  if (groupId && groupId !== task.groupId) {
    const newGroup = await GroupModel.findById(groupId);
    if (!newGroup) {
      throw new Error("Target group not found");
    }
    if (!newGroup.members.includes(userId) && newGroup.leader !== userId) {
      throw new Error("User not authorized to move task to this group");
    }
  }

  if (assignee) {
    const user = await UserModel.findOne({ email: assignee });
    if (!user || !group.members.includes(assignee)) {
      throw new Error("Assignee not found or not in group");
    }
  }

  const updates: Partial<Task> = {};
  if (title) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (groupId) updates.groupId = groupId;
  if (assignee !== undefined) updates.assignee = assignee;
  if (completed !== undefined) updates.completed = completed;

  const updatedTask = await TaskModel.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate("assignee", "_id email username");
  if (updatedTask) {
    const transformedTask = updatedTask.toObject({
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        if (ret.assignee && typeof ret.assignee === "object") {
          ret.assignee._id = ret.assignee._id.toString();
        }
        return ret;
      },
    });
    emitTaskUpdated(transformedTask);
    return transformedTask;
  }
  return null;
};

export const deleteTask = async (
  id: string,
  userId: string
): Promise<boolean> => {
  const task = await TaskModel.findById(id);
  if (!task) {
    return false;
  }

  const group = await GroupModel.findById(task.groupId);
  if (!group || (!group.members.includes(userId) && group.leader !== userId)) {
    throw new Error("User not authorized to delete this task");
  }

  await TaskModel.findByIdAndDelete(id);
  emitTaskDeleted(id, task.groupId);
  return true;
};
