import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  groupId: z.string().min(1, "Group ID is required"),
  assignee: z.string().optional(), 
});

export { taskSchema };
