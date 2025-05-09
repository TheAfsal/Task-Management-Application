import { Schema, model, Document } from "mongoose";
import type { Task } from "../types/task.types";

interface ITask extends Task, Document {}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    groupId: { type: String, ref:"Group", required: true },
    assignee: { type: String, ref:"User", default: null  },
  },
  { timestamps: true }
);

export default model<ITask>("Task", TaskSchema);