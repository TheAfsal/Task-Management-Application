import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { joinGroup, getPendingInvites, acceptInvite, rejectInvite } from "@/api/test";
import type { Invite } from "../../types/invite.types";

interface JoinGroupFormProps {
  fetchGroups: () => void;
}

export default function JoinGroupForm({ fetchGroups }: JoinGroupFormProps) {
  const [groupId, setGroupId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isProcessingInvite, setIsProcessingInvite] = useState<string | null>(null);

  const fetchInvites = async () => {
    try {
      const pendingInvites = await getPendingInvites();
      setInvites(pendingInvites);
    } catch (error) {
      toast.error("Failed to fetch pending invites");
      console.error("Error fetching invites:", error);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Joining group:", groupId);
      await joinGroup(groupId);
      toast.success("Successfully joined group");
      fetchGroups();
      setGroupId("");
    } catch (error) {
      toast.error("Failed to join group");
      console.error("Error joining group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setIsProcessingInvite(inviteId);
    try {
      await acceptInvite(inviteId);
      toast.success("Invitation accepted");
      setInvites((prev) => prev.filter((invite) => invite._id !== inviteId));
      fetchGroups();
    } catch (error) {
      toast.error("Failed to accept invitation");
      console.error("Error accepting invite:", error);
    } finally {
      setIsProcessingInvite(null);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    setIsProcessingInvite(inviteId);
    try {
      await rejectInvite(inviteId);
      toast.success("Invitation rejected");
      setInvites((prev) => prev.filter((invite) => invite._id !== inviteId));
    } catch (error) {
      toast.error("Failed to reject invitation");
      console.error("Error rejecting invite:", error);
    } finally {
      setIsProcessingInvite(null);
    }
  };

  return (
    <div className="space-y-6">
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

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">
                      Invitation to join group (ID: {invite.groupId})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sent to: {invite.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcceptInvite(invite._id)}
                      disabled={isProcessingInvite === invite._id}
                    >
                      {isProcessingInvite === invite._id ? "Accepting..." : "Accept"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectInvite(invite._id)}
                      disabled={isProcessingInvite === invite._id}
                    >
                      {isProcessingInvite === invite._id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}