import type { Task } from "../types/task.types";
import type { Group } from "../types/group.types";
// import type { Invite } from "../types/invite.types";
import api from "./axiosInstance";

// Tasks: Create a new task
export const postTask = async (data: Omit<Task, "_id" | "createdAt" | "updatedAt">): Promise<Task> => {
  try {
    const response = await api.post("/tasks", data);
    return response.data;
  } catch (error) {
    console.error("Failed to post task:", error);
    throw error;
  }
};

// Tasks: Get all tasks (optionally filtered by groupId)
export const getTasks = async (groupId?: string): Promise<Task[]> => {
  try {
    const response = await api.get("/tasks", { params: { groupId } });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    throw error;
  }
};

// Tasks: Update a task
export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  try {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update task:", error);
    throw error;
  }
};

// Tasks: Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw error;
  }
};

// Groups: Create a new group
export const postGroup = async (
  data: Omit<Group, "_id" | "createdAt" | "updatedAt" | "members" | "leader">
): Promise<Group> => {
  try {
    const response = await api.post("/groups", data);
    return response.data;
  } catch (error) {
    console.error("Failed to post group:", error);
    throw error;
  }
};

// Groups: Get all groups for the user
export const getGroups = async (): Promise<Group[]> => {
  try {
    const response = await api.get("/groups");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    throw error;
  }
};

// Groups: Update a group
export const updateGroup = async (id: string, data: Partial<Group>): Promise<Group> => {
  try {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update group:", error);
    throw error;
  }
};

// Groups: Delete a group
export const deleteGroup = async (id: string): Promise<void> => {
  try {
    await api.delete(`/groups/${id}`);
  } catch (error) {
    console.error("Failed to delete group:", error);
    throw error;
  }
};

// Groups: Join a group
export const joinGroup = async (groupId: string): Promise<Group> => {
  try {
    const response = await api.post("/groups/join", { groupId });
    return response.data;
  } catch (error) {
    console.error("Failed to join group:", error);
    throw error;
  }
};

// Invites: Send an invitation
export const postInvite = async (
  data: any
): Promise<any> => {
//   data: Omit<Invite, "_id" | "createdAt" | "updatedAt" | "status">
// ): Promise<Invite> => {
  try {
    const response = await api.post("/invites", data);
    return response.data;
  } catch (error) {
    console.error("Failed to post invite:", error);
    throw error;
  }
};