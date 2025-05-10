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
import { toast } from "sonner";
import type { Group } from "../types/group.types";
import type { Invite } from "../types/invite.types";
import { getGroups, getPendingInvites } from "@/api/test";
import { listenForGroupUpdates, listenForInviteUpdates } from "../services/socket";

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const userGroups = await getGroups();
      setGroups(userGroups);
    } catch (error) {
      toast.error("Failed to fetch groups");
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const invites = await getPendingInvites();
      setPendingInvites(invites);
    } catch (error) {
      toast.error("Failed to fetch pending invites");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchPendingInvites();

    const unsubscribeGroups = listenForGroupUpdates(
      (group) => {
        setGroups((prev) => [...prev, group]);
        toast.success(`New group "${group.name}" created`);
      },
      (group) => {
        setGroups((prev) => prev.map((g) => (g._id === group._id ? group : g)));
        toast.success(`Group "${group.name}" updated`);
      },
      ({ groupId }) => {
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        toast.success("Group deleted");
      },
      (group) => {
        setGroups((prev) => {
          if (prev.some((g) => g._id === group._id)) {
            return prev.map((g) => (g._id === group._id ? group : g));
          }
          return [...prev, group];
        });
        toast.success(`User joined group "${group.name}"`);
        fetchPendingInvites(); // Refresh invites after joining
      }
    );

    const unsubscribeInvites = listenForInviteUpdates((invite: Invite) => {
      setPendingInvites((prev) => [...prev, invite]);
      toast.success(`Received invitation to join group (ID: ${invite.groupId})`);
      fetchGroups(); // Refresh groups in case of new group data
    });

    return () => {
      unsubscribeGroups?.();
      unsubscribeInvites?.();
    };
  }, []);

  const handleGroupCreated = () => {
    setIsCreateGroupOpen(false);
    toast("Your group has been successfully created.");
    fetchGroups();
  };

  const handleInviteSent = () => {
    setIsInviteOpen(false);
    toast("Your invitation has been sent successfully.");
    fetchGroups();
    fetchPendingInvites();
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
                <JoinGroupForm fetchGroups={fetchGroups} invites={pendingInvites} />
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