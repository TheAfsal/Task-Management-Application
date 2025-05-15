import { Request, Response } from "express";
import * as groupService from "../services/groups.service";
import { Types } from "mongoose";
import { STATUS_CODE } from "constants/statusCode";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "User not authenticated" });
      return;
    }

    console.log(userId);

    const group = await groupService.createGroup({
      name,
      description,
      leader: userId,
    });

    res.status(STATUS_CODE.Created).json(group);
  } catch (error) {
    res.status(STATUS_CODE.Internal_Server_Error).json({ error: (error as Error).message });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "User not authenticated" });
      return;
    }

    const groups = await groupService.getGroups(userId);
    res.json(groups);
  } catch (error) {
    res.status(STATUS_CODE.Internal_Server_Error).json({ error: (error as Error).message });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, leader } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "User not authenticated" });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(STATUS_CODE.Bad_Request).json({ error: "Invalid group ID" });
      return;
    }

    const group = await groupService.updateGroup(id, {
      name,
      description,
      leader,
      userId,
    });

    if (!group) {
      res.status(STATUS_CODE.Not_Found).json({ error: "Group not found" });
      return;
    }

    res.json(group);
  } catch (error) {
    res.status(STATUS_CODE.Internal_Server_Error).json({ error: (error as Error).message });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "User not authenticated" });
      return;
    }

    if (!Types.ObjectId.isValid(id)) {
      res.status(STATUS_CODE.Bad_Request).json({ error: "Invalid group ID" });
      return;
    }

    const deleted = await groupService.deleteGroup(id, userId);

    if (!deleted) {
      res.status(STATUS_CODE.Not_Found).json({ error: "Group not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(STATUS_CODE.Internal_Server_Error).json({ error: (error as Error).message });
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "User not authenticated" });
      return;
    }

    if (!Types.ObjectId.isValid(groupId)) {
      res.status(STATUS_CODE.Bad_Request).json({ error: "Invalid group ID" });
      return;
    }

    const group = await groupService.joinGroup(groupId, userId);

    if (!group) {
      res.status(STATUS_CODE.Not_Found).json({ error: "Group not found or invite invalid" });
      return;
    }

    res.json(group);
  } catch (error) {
    res.status(STATUS_CODE.Internal_Server_Error).json({ error: (error as Error).message });
  }
};
