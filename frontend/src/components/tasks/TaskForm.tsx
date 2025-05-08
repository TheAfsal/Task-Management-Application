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
import type { Group, memberDetails } from "../../types/group.types";
import { postTask } from "@/api/test";

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

  useEffect(() => {
    if (groupId) {
      const selectedGroup = groups.find((g) => g._id === groupId);
      setAvailableMembers(selectedGroup?.members || []);

      // if (assignee && !selectedGroup?.members.includes(assignee)) {
      //   setAssignee("");
      // }
    } else {
      setAvailableMembers([]);
      setAssignee("");
    }
  }, [groupId, groups, assignee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await postTask({
        title,
        description,
        groupId,
        assignee,
        completed: false,
      });

      setTitle("");
      setDescription("");
      setGroupId(initialGroupId);
      setAssignee("");
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
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

        <div className="space-y-2">
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
                <SelectItem key={member._id} value={member._id}>
                  {member.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
