import type { memberDetails } from "./group.types"

export interface Task {
  _id: string
  title: string
  description?: string
  completed: boolean
  groupId?: string
  assignee?: memberDetails
}
export interface TaskSubmitForm {
  title: string
  description?: string
  completed: boolean
  groupId: string
  assignee?: string
}

// Omit<Task, "_id" | "createdAt" | "updatedAt">

export interface TaskFormProps {
  fetchTasks: () => Promise<void>
}

export interface TaskListProps {
  tasks: Task[]
  fetchTasks: () => Promise<void>
}


