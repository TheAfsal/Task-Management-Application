/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import SearchFilterSort from "../components/tasks/SearchFilterSort";
import GroupSelector from "../components/groups/GroupSelector";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
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
import {
  listenForTaskUpdates,
  listenForGroupUpdates,
} from "../services/socket";

export default function Home() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("");
  const [sortBy, setSortBy] = useState("");
  const limit = 10;

  const fetchTasks = async (page: number = 1) => {
    try {
      const response = await getTasks(
        filterGroup || undefined,
        page,
        limit,
        search,
        filterAssignee || undefined,
        filterCompleted === "completed"
          ? "true"
          : filterCompleted === "incomplete"
          ? "false"
          : undefined,
        sortBy || undefined
      );
      setTasks(response.tasks);
      setFilteredTasks(response.tasks);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    }
  };

  const fetchGroups = async () => {
    try {
      const userGroups = await getGroups();
      setGroups(userGroups);
    } catch (error) {
      toast.error("Failed to fetch groups");
    }
  };

  const fetchDetails = async () => {
    await Promise.all([fetchTasks(currentPage), fetchGroups()]);
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setFilterGroup(groupId);
    setCurrentPage(1);
    fetchTasks(1);
  };

  const handleCreateTask = () => {
    setIsTaskFormOpen(true);
  };

  const handleTaskAdded = () => {
    setIsTaskFormOpen(false);
    toast("Your task has been successfully created.");
    fetchTasks(currentPage);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchTasks(page);
  };

  const handleSearchFilterSort = (
    search: string,
    filterGroup: string,
    filterAssignee: string,
    filterCompleted: string,
    sortBy: string
  ) => {
    setSearch(search);
    setFilterGroup(filterGroup);
    setFilterAssignee(filterAssignee);
    setFilterCompleted(filterCompleted);
    setSortBy(sortBy);
    setCurrentPage(1);
    fetchTasks(1);
  };

  const matchesFilters = (task: Task) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      task.title.toLowerCase().includes(searchLower) ||
      (task.description &&
        task.description.toLowerCase().includes(searchLower));
    const matchesGroup = !filterGroup || task.groupId === filterGroup;
    const matchesAssignee =
      !filterAssignee ||
      (task.assignee && task.assignee.email === filterAssignee);
    const matchesCompleted =
      !filterCompleted || task.completed === (filterCompleted === "completed");
    return matchesSearch && matchesGroup && matchesAssignee && matchesCompleted;
  };

  useEffect(() => {
    fetchDetails();

    const unsubscribeTasks = listenForTaskUpdates(
      (task) => {
        if (matchesFilters(task)) {
          setTasks((prev) => {
            if (prev.some((t) => t._id === task._id)) return prev;
            if (prev.length < limit) return [...prev, task];
            return prev;
          });
          setFilteredTasks((prev) => {
            if (prev.some((t) => t._id === task._id)) return prev;
            if (prev.length < limit) return [...prev, task];
            return prev;
          });
          toast.success(`New task "${task.title}" created`);
        }
      },
      (task) => {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
        if (matchesFilters(task)) {
          setFilteredTasks((prev) =>
            prev.map((t) => (t._id === task._id ? task : t))
          );
          toast.success(`Task "${task.title}" updated`);
        } else if (filteredTasks.some((t) => t._id === task._id)) {
          setFilteredTasks((prev) => prev.filter((t) => t._id !== task._id));
        }
      },
      ({ taskId }) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        setFilteredTasks((prev) => prev.filter((t) => t._id !== taskId));
        toast.success("Task deleted");
        if (filteredTasks.length === 1 && currentPage === totalPages) {
          handlePageChange(currentPage > 1 ? currentPage - 1 : 1);
        }
      }
    );

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
        if (selectedGroup === groupId) {
          setSelectedGroup("");
          setFilterGroup("");
          setFilteredTasks(tasks);
        }
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
        fetchTasks(currentPage); // Refresh tasks to include new group's tasks
      }
    );

    return () => {
      unsubscribeTasks?.();
      unsubscribeGroups?.();
    };
  }, []);

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
          onSearchFilterSort={handleSearchFilterSort}
          groups={groups}
          selectedGroup={selectedGroup}
        />

        <TaskList
          tasks={filteredTasks}
          fetchTasks={() => fetchTasks(currentPage)}
          groups={groups}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            //@ts-ignore
            fetchTasks={handleTaskAdded}
            groups={groups}
            initialGroupId={selectedGroup}
            onCancel={() => setIsTaskFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
