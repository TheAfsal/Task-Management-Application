import { Schema, model, Document, Model } from 'mongoose';
import type { ITask } from '../interfaces/task.interface';

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    groupId: { type: String, ref: 'Group', required: true },
    createdBy: { type: String, ref: 'User', default: null },
    assignee: { type: String, ref: 'User', default: null },
  },
  { timestamps: true, versionKey: '__v' }
);

const TaskModel: Model<ITask> = model<ITask>('Task', TaskSchema);
export default TaskModel;
