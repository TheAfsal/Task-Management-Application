import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import type { Task } from "../types/task.types";
import type { Group } from "../types/group.types";
import type { Invite } from "../types/invite.types";

let socket: Socket | null = null;
const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const initializeSocket = () => {
  if (socket) return socket;

  const token = useAuthStore.getState().accessToken;
  if (!token) {
    console.error("No JWT token found for Socket.IO connection");
    return null;
  }

  socket = io(baseURL, {
    auth: { token },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error.message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Socket.IO server");
  });

  return socket;
};

export const listenForTaskUpdates = (
  onTaskCreated: (task: Task) => void,
  onTaskUpdated: (task: Task) => void,
  onTaskDeleted: (data: { taskId: string }) => void
) => {
  const socket = initializeSocket();
  if (!socket) return;

  socket.on("task:created", onTaskCreated);
  socket.on("task:updated", onTaskUpdated);
  socket.on("task:deleted", onTaskDeleted);

  return () => {
    socket?.off("task:created", onTaskCreated);
    socket?.off("task:updated", onTaskUpdated);
    socket?.off("task:deleted", onTaskDeleted);
  };
};

export const listenForGroupUpdates = (
  onGroupCreated: (group: Group) => void,
  onGroupUpdated: (group: Group) => void,
  onGroupDeleted: (data: { groupId: string }) => void,
  onGroupJoined: (group: Group) => void
) => {
  const socket = initializeSocket();
  if (!socket) return;

  socket.on("group:created", onGroupCreated);
  socket.on("group:updated", onGroupUpdated);
  socket.on("group:deleted", onGroupDeleted);
  socket.on("group:joined", onGroupJoined);

  return () => {
    socket?.off("group:created", onGroupCreated);
    socket?.off("group:updated", onGroupUpdated);
    socket?.off("group:deleted", onGroupDeleted);
    socket?.off("group:joined", onGroupJoined);
  };
};

export const listenForInviteUpdates = (
  onInviteSent: (invite: Invite) => void
) => {
  const socket = initializeSocket();
  if (!socket) return;

  socket.on("invite:sent", onInviteSent);

  return () => {
    socket?.off("invite:sent", onInviteSent);
  };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
