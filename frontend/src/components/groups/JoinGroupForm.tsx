"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface JoinGroupFormProps {
  fetchGroups: () => void;
}

export default function JoinGroupForm({ fetchGroups }: JoinGroupFormProps) {
  const [groupId, setGroupId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Joining group:", groupId);
      console.log("@@@");

      fetchGroups();
      // await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay
      setGroupId("");
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="groupId">Group ID or Invite Code</Label>
        <Input
          id="groupId"
          type="text"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="Enter group ID or invitation code"
          required
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join Group"}
        </Button>
      </div>
    </form>
  );
}
