import mongoose, { Schema, model } from 'mongoose'

interface ITask {
  title: string
  description?: string
  completed: boolean
  createdAt: Date
}

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default model<ITask>('Task', taskSchema)