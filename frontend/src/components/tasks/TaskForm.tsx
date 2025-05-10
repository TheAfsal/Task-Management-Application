import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Group, memberDetails } from "../../types/group.types";
import { postTask } from "@/api/test";

// Zod schema for task form validation
const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  groupId: z.string().min(1, "Group is required"),
  assignee: z.string().optional(),
  completed: z.boolean().default(false),
});

interface TaskFormProps {
  fetchTasks: () => Promise<void>;
  groups: Group[];
  initialGroupId?: string;
  onCancel?: () => void;
}

export default function TaskForm({
  fetchTasks,
  groups,
  initialGroupId = "",
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState(initialGroupId);
  const [assignee, setAssignee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<memberDetails[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<typeof taskSchema>, string>>>({});

  useEffect(() => {
    if (groupId) {
      const selectedGroup = groups.find((g) => g._id === groupId);
      if (selectedGroup) {
        setAvailableMembers(selectedGroup.members);
        if (assignee && !selectedGroup.members.find((m) => m._id === assignee)) {
          setAssignee("");
        }
      } else {
        setAvailableMembers([]);
        setAssignee("");
      }
    } else {
      setAvailableMembers([]);
      setAssignee("");
    }
  }, [groupId, groups, assignee]);

  const validateForm = () => {
    const result = taskSchema.safeParse({
      title,
      description,
      groupId,
      assignee,
      completed: false,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof z.infer<typeof taskSchema>, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof z.infer<typeof taskSchema>;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    // Additional validation: assignee must be a group member if provided
    if (assignee && groupId) {
      const selectedGroup = groups.find((g) => g._id === groupId);
      if (!selectedGroup?.members.find((m) => m._id === assignee)) {
        setErrors({ assignee: "Assignee must be a member of the selected group" });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await postTask({
        title,
        description,
        groupId,
        assignee: assignee || undefined,
        completed: false,
      });

      toast.success("Task created successfully");
      setTitle("");
      setDescription("");
      setGroupId(initialGroupId);
      setAssignee("");
      await fetchTasks();
      onCancel?.();
    } catch (error) {
      toast.error((error as Error).message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          placeholder="Enter task title"
          required
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder="Describe the task"
          rows={3}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="group">Group</Label>
          <Select
            value={groupId}
            onValueChange={(value) => {
              setGroupId(value);
              setErrors((prev) => ({ ...prev, groupId: undefined }));
            }}
          >
            <SelectTrigger id="group">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group._id} value={group._id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.groupId && <p className="text-red-500 text-sm">{errors.groupId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignee">Assignee</Label>
          <Select
            value={assignee}
            onValueChange={(value) => {
              setAssignee(value);
              setErrors((prev) => ({ ...prev, assignee: undefined }));
            }}
            disabled={!groupId || availableMembers.length === 0}
          >
            <SelectTrigger id="assignee">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {availableMembers.map((member) => (
                <SelectItem key={member._id} value={member._id}>
                  {member.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assignee && <p className="text-red-500 text-sm">{errors.assignee}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim() || !groupId}
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
}