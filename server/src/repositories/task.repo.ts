import { Model } from 'mongoose';
import TaskModel from '../models/Task.model';
import GroupModel from '../models/Group.model';
import { ITask, ITaskRepository } from '../interfaces/task.interface';
import BaseRepository from './base.repo';

export class TaskRepository extends BaseRepository<ITask> implements ITaskRepository {
  constructor() {
    super(TaskModel);
  }

  async findTasksByGroupIds(groupIds: string[], search?: string, skip: number = 0, limit: number = 10): Promise<ITask[]> {
    const query: any = { groupId: { $in: groupIds } };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return this.model
      .find(query)
      .populate('assignee', '_id email username')
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countTasksByGroupIds(groupIds: string[], search?: string): Promise<number> {
    const query: any = { groupId: { $in: groupIds } };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return this.model.countDocuments(query).exec();
  }

  async getTaskStatistics(userId: string, groupIds: string[]): Promise<{
    completed: number;
    incomplete: number;
    overdueByGroup: Array<{ groupId: string; groupName: string; count: number }>;
  }> {
    const completed = await this.model.countDocuments({
      groupId: { $in: groupIds },
      completed: true,
    }).exec();

    const incomplete = await this.model.countDocuments({
      groupId: { $in: groupIds },
      completed: false,
    }).exec();

    const overdueByGroup = await this.model.aggregate([
      {
        $match: {
          groupId: { $in: groupIds },
          completed: false,
          dueDate: { $lt: new Date() },
        },
      },
      {
        $group: {
          _id: '$groupId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'groups',
          localField: '_id',
          foreignField: '_id',
          as: 'group',
        },
      },
      {
        $unwind: '$group',
      },
      {
        $project: {
          groupId: '$_id',
          groupName: '$group.name',
          count: 1,
        },
      },
    ]);

    return { completed, incomplete, overdueByGroup };
  }
}