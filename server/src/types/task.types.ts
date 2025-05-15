export interface Task {
    title: string;
    description?: string;
    completed: boolean;
    groupId: string;
    assignee?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
  }