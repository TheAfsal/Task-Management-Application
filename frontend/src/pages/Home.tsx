"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import SearchFilterSort from "../components/tasks/SearchFilterSort";
import GroupSelector from "../components/groups/GroupSelector";
import { Button } from "../components/ui/button";
// import { useToast } from "../components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import type { Task } from "../types/task.types";
import type { Group } from "../types/group.types";
import { getGroups, getTasks } from "@/api/test";

export default function Home() {
  const navigate = useNavigate();
  // const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([
    // {
    //   _id: "1",
    //   title: "Task 1",
    //   description: "Description 1",
    //   completed: false,
    //   groupId: "g1",
    //   assignee: "user1@example.com",
    // },
    // {
    //   _id: "2",
    //   title: "Task 2",
    //   description: "Description 2",
    //   completed: true,
    //   groupId: "g1",
    //   assignee: "user2@example.com",
    // },
    // {
    //   _id: "3",
    //   title: "Task 3",
    //   description: "Description 3",
    //   completed: false,
    //   groupId: "g2",
    //   assignee: "user3@example.com",
    // },
  ]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  useEffect(() => {
    fetchDetails();
    setFilteredTasks(tasks);
  }, [tasks]);

  const fetchTasks = async () => {
    setFilteredTasks(tasks);
    return getTasks()
  };

  const fetchDetails = async () => {
    const userGroups = await getGroups();
    const allTasks = await getTasks()
    setGroups(userGroups);
    setTasks(allTasks);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    if (groupId) {
      setFilteredTasks(tasks.filter((task) => task.groupId === groupId));
    } else {
      setFilteredTasks(tasks);
    }
  };

  const handleCreateTask = () => {
    setIsTaskFormOpen(true);
  };

  const handleTaskAdded = () => {
    setIsTaskFormOpen(false);
    // toast({
    //   title: "Task created",
    //   description: "Your task has been successfully created",
    // })
    fetchTasks();
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Tasks Dashboard</h1>
          <div className="flex items-center gap-4">
            <GroupSelector
              groups={groups}
              selectedGroup={selectedGroup}
              onGroupChange={handleGroupChange}
            />
            <Button onClick={() => navigate("/groups")} variant="outline">
              Manage Groups
            </Button>
            <Button onClick={handleCreateTask}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        <SearchFilterSort
          tasks={tasks}
          setFilteredTasks={setFilteredTasks}
          groups={groups}
          selectedGroup={selectedGroup}
        />

        <TaskList
          tasks={filteredTasks}
          fetchTasks={fetchTasks}
          groups={groups}
        />

        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your project. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              fetchTasks={handleTaskAdded}
              groups={groups}
              initialGroupId={selectedGroup}
              onCancel={() => setIsTaskFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
