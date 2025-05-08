"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { InviteFormProps } from "@/types/invite.types";



export default function InviteForm({
  fetchGroups,
  groups,
  onCancel,
}: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [groupId, setGroupId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      console.log("Inviting user:", email, "to group:", groupId);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      setEmail("");
      setGroupId("");
      fetchGroups();
    } catch (error) {
      console.error("Error sending invite:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="group">Select Group</Label>
        <Select value={groupId} onValueChange={setGroupId} required>
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

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Invitation"}
        </Button>
      </div>
    </form>
  );
}
