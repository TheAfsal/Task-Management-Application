import { z } from "zod";

const createGroupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    description: z.string().optional(),
  });

export { createGroupSchema };
