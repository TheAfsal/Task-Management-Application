export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskFormProps {
    fetchTasks: () => Promise<void>
  }