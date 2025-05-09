import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import GroupModel from "./models/Group.model";
import type { Task } from "./types/task.types";
import type { Group } from "./types/group.types";
import type { Invite } from "./types/invite.types";

interface AuthenticatedSocket extends Socket {
  user?: { userId: string };
}

let ioInstance: Server;

const initializeSocket = (io: Server) => {
  ioInstance = io;

  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      socket.user = { userId: decoded.userId };

      // Join rooms for all groups the user is part of
      const groups = await GroupModel.find({
        $or: [{ leader: decoded.userId }, { members: decoded.userId }],
      });

      for (const group of groups) {
        //@ts-ignore
        socket.join(group._id.toString());
      }

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.userId}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user?.userId}`);
    });
  });
};

// Emit task-related events
export const emitTaskCreated = (task: Task) => {
  ioInstance.to(task.groupId).emit("task:created", task);
};

export const emitTaskUpdated = (task: Task) => {
  ioInstance.to(task.groupId).emit("task:updated", task);
};

export const emitTaskDeleted = (taskId: string, groupId: string) => {
  ioInstance.to(groupId).emit("task:deleted", { taskId });
};

// Emit group-related events
export const emitGroupCreated = (group: Group) => {
  group.members.forEach((member) => {
    //@ts-ignore
    ioInstance.to(group._id.toString()).emit("group:created", group);
  });
};

export const emitGroupUpdated = (group: Group) => {
  //@ts-ignore
  ioInstance.to(group._id.toString()).emit("group:updated", group);
};

export const emitGroupDeleted = (groupId: string) => {
  ioInstance.to(groupId).emit("group:deleted", { groupId });
};

export const emitGroupJoined = (group: Group) => {
  //@ts-ignore
  ioInstance.to(group._id.toString()).emit("group:joined", group);
};

// Emit invite-related events
export const emitInviteSent = (invite: Invite) => {
  ioInstance.to(invite.groupId).emit("invite:sent", invite);
};

export default initializeSocket;
