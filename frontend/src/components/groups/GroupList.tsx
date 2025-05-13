"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { MoreHorizontal, Users, Crown, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { useToast } from "../ui/use-toast";
import type { Group } from "../../types/group.types";

interface GroupListProps {
  groups: Group[];
  fetchGroups: () => void;
}

export default function GroupList({ groups, fetchGroups }: GroupListProps) {
  // const { toast } = useToast();
  const [selectedGroup] = useState<Group | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const handleTransferLeadership = (newLeader: string) => {
    if (!selectedGroup) return;

    // Simulate API call
    console.log("Transferring leadership:", selectedGroup._id, newLeader);

    // toast({
    //   title: "Leadership transferred",
    //   description: `Leadership has been transferred to ${newLeader}`,
    // });

    setIsTransferOpen(false);
    fetchGroups();
  };

  const handleDeleteGroup = (groupId: string) => {
    // Simulate API call
    console.log("Deleting group:", groupId);

    // toast({
    //   title: "Group deleted",
    //   description: "The group has been successfully deleted",
    //   variant: "destructive",
    // });

    fetchGroups();
  };

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  if (groups.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have any groups yet. Create a group to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <Card key={group._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription className="mt-1">
                  {group.description}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsTransferOpen(true);
                    }}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Transfer Leadership
                  </DropdownMenuItem> */}
                  <DropdownMenuItem
                    onClick={() => handleDeleteGroup(group._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-sm">{`${group.leader.username} (${group.leader.email})`}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.members.map((member) => (
                <Badge
                  key={member._id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(member.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate max-w-[120px]">
                    {`${member.username} (${member.email})`}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 px-6 py-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="mr-1 h-3 w-3" />
              {group.members.length} members
            </div>
          </CardFooter>
        </Card>
      ))}

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transfer Leadership</DialogTitle>
            <DialogDescription>
              Select a member to transfer group leadership to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select onValueChange={handleTransferLeadership}>
              <SelectTrigger>
                <SelectValue placeholder="Select new leader" />
              </SelectTrigger>
              <SelectContent>
                {selectedGroup?.members
                  .filter((m) => m !== selectedGroup.leader)
                  .map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
