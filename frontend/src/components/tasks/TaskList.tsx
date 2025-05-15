/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
// import { useToast } from "../ui/use-toast"
import TaskEditForm from "./TaskEditForm";
import type { Task } from "../../types/task.types";
import type { Group } from "../../types/group.types";
import { deleteTask, updateTask } from "@/api/test";
import { useAuthStore } from "@/store/authStore";

interface TaskListProps {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  groups: Group[];
}

export default function TaskList({ tasks, fetchTasks, groups }: TaskListProps) {
  // const { toast } = useToast()
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuthStore((state) => state);

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      await updateTask(id, { completed: !completed });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleTaskUpdated = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null);

    // toast({
    //   title: "Task updated",
    //   description: "The task has been successfully updated",
    // })

    fetchTasks();
  };

  const getGroupName = (groupId: string) => {
    return groups.find((g) => g._id === groupId)?.name || "Unknown Group";
  };

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No tasks found. Create a new task to get started.
          </p>
        </CardContent>
      </Card>
    );
  }
  console.log("@@ task", tasks);

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task._id} className={task.completed ? "bg-muted/50" : ""}>
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div className="flex items-start gap-2">
              {user?.id === task?.assignee?._id && (
                <Checkbox
                  id={`task-${task._id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggle(task._id, task.completed)}
                  className="mt-1"
                />
              )}
              <div>
                <CardTitle
                  className={`text-lg ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </CardTitle>
                {task.groupId && (
                  <Badge variant="outline" className="mt-1">
                    {getGroupName(task.groupId)}
                  </Badge>
                )}
              </div>
            </div>
            {user?.id === task.createdBy && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggle(task._id, task.completed)}
                  >
                    {task.completed ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark as Incomplete
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(task._id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardHeader>

          {task.description && (
            <CardContent className="pb-2">
              <p
                className={`text-sm ${
                  task.completed ? "text-muted-foreground" : ""
                }`}
              >
                {task.description}
              </p>
            </CardContent>
          )}

          {task.assignee && (
            <CardFooter className="pt-0">
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="mr-1 h-3 w-3" />
                {task.assignee.username}
              </div>
            </CardFooter>
          )}
        </Card>
      ))}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <TaskEditForm
              task={editingTask}
              //@ts-ignore
              fetchTasks={handleTaskUpdated}
              setEditingTask={setEditingTask}
              groups={groups}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
