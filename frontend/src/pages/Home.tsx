/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useEffect, useCallback, useRef } from "react";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import Search from "../components/tasks/SearchFilterSort";
import GroupSelector from "../components/groups/GroupSelector";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import type { Task } from "../types/task.types";
import type { Group } from "../types/group.types";
import { getGroups, getStatistics, getTasks } from "@/api/test";
import {
  listenForTaskUpdates,
  listenForGroupUpdates,
} from "../services/socket";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export interface TaskStatistics {
  completed: number;
  incomplete: number;
  overdueByGroup: { groupId: string; groupName: string; count: number }[];
}

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
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const limit = 10;
  const lastRequest = useRef<string | null>(null); // Track last request to deduplicate

  const fetchTasks = useCallback(
    async (page: number = 1) => {
      const requestKey = `${selectedGroup || "all"}-${page}-${search || ""}`; // Unique key for request
      if (lastRequest.current === requestKey) return; // Skip if duplicate request

      lastRequest.current = requestKey;
      try {
        const response = await getTasks(
          selectedGroup || undefined,
          page,
          limit,
          search || undefined
        );
        setTasks(response.tasks);
        setFilteredTasks(response.tasks);
        setTotalPages(response.totalPages);
        setCurrentPage(page);
      } catch (error) {
        toast.error("Failed to fetch tasks");
      } finally {
        lastRequest.current = null; // Reset after completion
      }
    },
    [selectedGroup, search]
  );

  const fetchGroups = async () => {
    try {
      const userGroups = await getGroups();
      setGroups(userGroups);
    } catch (error) {
      toast.error("Failed to fetch groups");
    }
  };

  const fetchStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const data = await getStatistics();
      setStatistics(data);
    } catch (error) {
      toast.error("Failed to fetch task statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchDetails = async () => {
    await Promise.all([
      fetchTasks(currentPage),
      fetchGroups(),
      fetchStatistics(),
    ]);
  };

  const handleGroupChange = useCallback(
    (groupId: string) => {
      setSelectedGroup(groupId);
      setCurrentPage(1);
      fetchTasks(1);
    },
    [fetchTasks]
  );

  const handleCreateTask = useCallback(() => {
    setIsTaskFormOpen(true);
  }, []);

  const handleTaskAdded = useCallback(() => {
    setIsTaskFormOpen(false);
    toast("Your task has been successfully created.");
    fetchTasks(currentPage);
    fetchStatistics();
  }, [fetchTasks, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      fetchTasks(page);
    },
    [fetchTasks, totalPages]
  );

  const handleSearch = useCallback(
    (search: string) => {
      setSearch(search);
      setCurrentPage(1);
      fetchTasks(1);
    },
    [fetchTasks]
  );

  const matchesSearch = useCallback(
    (task: Task) => {
      const searchLower = search.toLowerCase();
      return (
        !search ||
        task.title.toLowerCase().includes(searchLower) ||
        (task.description &&
          task.description.toLowerCase().includes(searchLower))
      );
    },
    [search]
  );

  useEffect(() => {
    fetchDetails();

    const unsubscribeTasks = listenForTaskUpdates(
      (task) => {
        if (matchesSearch(task)) {
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
        fetchStatistics();
      },
      (task) => {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
        if (matchesSearch(task)) {
          setFilteredTasks((prev) =>
            prev.map((t) => (t._id === task._id ? task : t))
          );
          toast.success(`Task "${task.title}" updated`);
        } else if (filteredTasks.some((t) => t._id === task._id)) {
          setFilteredTasks((prev) => prev.filter((t) => t._id !== task._id));
        }
        fetchStatistics();
      },
      ({ taskId }) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        setFilteredTasks((prev) => prev.filter((t) => t._id !== taskId));
        toast.success("Task deleted");
        if (filteredTasks.length === 1 && currentPage === totalPages) {
          handlePageChange(currentPage > 1 ? currentPage - 1 : 1);
        }
        fetchStatistics();
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
        fetchTasks(currentPage);
        fetchStatistics();
      }
    );

    return () => {
      unsubscribeTasks?.();
      unsubscribeGroups?.();
    };
  }, []); // Empty dependency array to run only once on mount

  const pieChartData = statistics
    ? {
        labels: ["Completed", "Incomplete"],
        datasets: [
          {
            data: [statistics.completed, statistics.incomplete],
            backgroundColor: ["#10B981", "#EF4444"],
            borderColor: ["#064E3B", "#991B1B"],
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const barChartData = statistics
    ? {
        labels: statistics.overdueByGroup.map((g) => g.groupName),
        datasets: [
          {
            label: "Overdue Tasks",
            data: statistics.overdueByGroup.map((g) => g.count),
            backgroundColor: "#3B82F6",
            borderColor: "#1E40AF",
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const, labels: { font: { size: 12 } } },
      tooltip: { bodyFont: { size: 12 } },
    },
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
      <div className="flex flex-col space-y-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Tasks Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <GroupSelector
              groups={groups}
              selectedGroup={selectedGroup}
              onGroupChange={handleGroupChange}
            />
            <Button
              onClick={() => navigate("/groups")}
              variant="outline"
              size="sm"
            >
              Manage Groups
            </Button>
            <Button onClick={handleCreateTask} size="sm">
              <PlusCircle className="mr-2 h-4 w-4 sm:block hidden" />
              New Task
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl font-semibold">
              Task Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoadingStats ? (
              <div className="text-center text-xs text-muted-foreground">
                Loading statistics...
              </div>
            ) : !statistics ? (
              <div className="text-center text-xs text-muted-foreground">
                No statistics available
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Task Completion
                  </h3>
                  <div className="w-full aspect-[4/3]">
                    <Pie data={pieChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    Overdue Tasks by Group
                  </h3>
                  <div className="w-full aspect-[4/3]">
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Search onSearch={handleSearch} />

        <TaskList
          tasks={filteredTasks}
          fetchTasks={() => fetchTasks(currentPage)}
          groups={groups}
        />

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10"
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
        <DialogContent className="w-[90vw] max-w-[600px]">
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
