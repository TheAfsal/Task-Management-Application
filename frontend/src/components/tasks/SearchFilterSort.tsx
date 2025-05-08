"use client"

import { useState, useEffect } from "react"
import { Search, Filter, SortAsc } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Card, CardContent } from "../ui/card"
import type { Task } from "../../types/task.types"
import type { Group } from "../../types/group.types"

interface SearchFilterSortProps {
  tasks: Task[]
  setFilteredTasks: (tasks: Task[]) => void
  groups: Group[]
  selectedGroup?: string
}

export default function SearchFilterSort({
  tasks,
  setFilteredTasks,
  groups,
  selectedGroup = "",
}: SearchFilterSortProps) {
  const [search, setSearch] = useState("")
  const [filterGroup, setFilterGroup] = useState(selectedGroup)
  const [filterAssignee, setFilterAssignee] = useState("")
  const [filterCompleted, setFilterCompleted] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Update filter when selectedGroup changes
  useEffect(() => {
    setFilterGroup(selectedGroup)
  }, [selectedGroup])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = tasks

    if (search) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          (task.description?.toLowerCase() || "").includes(search.toLowerCase()),
      )
    }

    if (filterGroup) {
      filtered = filtered.filter((task) => task.groupId === filterGroup)
    }

    if (filterAssignee) {
      filtered = filtered.filter((task) => task.assignee === filterAssignee)
    }

    if (filterCompleted) {
      filtered = filtered.filter((task) => task.completed === (filterCompleted === "completed"))
    }

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title)
        if (sortBy === "completed") {
          if (a.completed === b.completed) return 0
          return a.completed ? -1 : 1
        }
        return 0
      })
    }

    setFilteredTasks(filtered)
  }, [search, filterGroup, filterAssignee, filterCompleted, sortBy, tasks, setFilteredTasks])

  // Get all unique members from groups
  const allMembers = Array.from(new Set(groups.flatMap((g) => g.members)))

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Tasks</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Group</label>
                    <Select value={filterGroup} onValueChange={setFilterGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group._id} value={group._id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assignee</label>
                    <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Assignees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {allMembers.map((member) => (
                          <SelectItem key={member._id} value={member.email}>
                            {member.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterCompleted} onValueChange={setFilterCompleted}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterGroup(selectedGroup)
                        setFilterAssignee("")
                        setFilterCompleted("")
                        setIsFilterOpen(false)
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <SortAsc className="h-4 w-4" />
                  <span className="sr-only">Sort</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Sort Tasks</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="completed">Completion Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSortBy("")
                        setIsSortOpen(false)
                      }}
                    >
                      Reset Sort
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
