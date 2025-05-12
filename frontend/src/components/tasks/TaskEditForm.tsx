/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Checkbox } from "../ui/checkbox";
import type { Task } from "../../types/task.types";
import type { Group } from "../../types/group.types";
import { updateTask } from "@/api/test";

interface TaskEditFormProps {
  task: Task;
  fetchTasks: () => Promise<void>;
  setEditingTask: (task: Task | null) => void;
  groups: Group[];
  onCancel?: () => void;
}

export default function TaskEditForm({
  task,
  fetchTasks,
  setEditingTask,
  groups,
  onCancel,
}: TaskEditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [groupId, setGroupId] = useState(task.groupId || "");
  const [assignee, setAssignee] = useState(task.assignee || "");
  const [completed, setCompleted] = useState(task.completed);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<string[]>([]);

  useEffect(() => {
    if (groupId) {
      const selectedGroup = groups.find((g) => g._id === groupId);
      //@ts-ignore
      setAvailableMembers(selectedGroup?.members || []);
      
      console.log(availableMembers);
      
      //@ts-ignore
      if (assignee && !selectedGroup?.members.includes(assignee)) {
        setAssignee("");
      }
    } else {
      setAvailableMembers([]);
      setAssignee("");
    }
  }, [groupId, groups, assignee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      // console.log("Updating task:", {
      //   _id: task._id,
      //   title,
      //   description,
      //   groupId,
      //   assignee,
      //   completed,
      // });
      await updateTask(task._id, {
        title,
        description,
        groupId,
        //  assignee,
        completed,
      });
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="group">Group</Label>
          <Select value={groupId} onValueChange={setGroupId}>
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
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="assignee">Assignee</Label>
          <Select
            value={assignee}
            onValueChange={setAssignee}
            disabled={!groupId || availableMembers.length === 0}
          >
            <SelectTrigger id="assignee">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {availableMembers.map((member) => (
                <SelectItem key={member} value={member}>
                  {member}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="completed"
          checked={completed}
          onCheckedChange={(checked) => setCompleted(checked as boolean)}
        />
        <Label htmlFor="completed">Mark as completed</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
