"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ArrowLeft, Plus, UserPlus, Users } from "lucide-react";
import GroupForm from "../components/groups/GroupForm";
import GroupList from "../components/groups/GroupList";
import InviteForm from "../components/groups/InviteForm";
import JoinGroupForm from "../components/groups/JoinGroupForm";
// import { useToast } from "../components/ui/use-toast"
import type { Group } from "../types/group.types";
import { getGroups } from "@/api/test";

export default function Groups() {
  const navigate = useNavigate();
  //   const { toast } = useToast()
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchGroups = async () => {
    const userGroups = await getGroups();
    setGroups(userGroups);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const userGroups = await getGroups();
      setGroups(userGroups);
    };
    fetchGroups();
  }, []);

  const handleGroupCreated = () => {
    setIsCreateGroupOpen(false);
    // toast({
    //   title: "Group created",
    //   description: "Your group has been successfully created",
    // })
    fetchGroups();
  };

  const handleInviteSent = () => {
    setIsInviteOpen(false);
    // toast({
    //   title: "Invitation sent",
    //   description: "Your invitation has been sent successfully",
    // })
    fetchGroups();
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-primary">
              Group Management
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsInviteOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
            <Button onClick={() => setIsCreateGroupOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </div>

        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-groups">
              <Users className="mr-2 h-4 w-4" />
              My Groups
            </TabsTrigger>
            <TabsTrigger value="join-group">
              <UserPlus className="mr-2 h-4 w-4" />
              Join Group
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-groups" className="mt-6">
            <GroupList groups={groups} fetchGroups={fetchGroups} />
          </TabsContent>
          <TabsContent value="join-group" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Join an Existing Group</CardTitle>
                <CardDescription>
                  Enter a group ID or invitation code to join an existing group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JoinGroupForm fetchGroups={fetchGroups} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new group for collaboration. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              fetchGroups={handleGroupCreated}
              onCancel={() => setIsCreateGroupOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Invite someone to join your group by email.
              </DialogDescription>
            </DialogHeader>
            <InviteForm
              fetchGroups={handleInviteSent}
              groups={groups}
              onCancel={() => setIsInviteOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
