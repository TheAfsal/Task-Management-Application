import { Request, Response } from "express";
import * as inviteService from "../services/invites.service";

export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { email, groupId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return
    }

    const invite = await inviteService.sendInvite({
      email,
      groupId,
      userId,
    });

    res.status(201).json(invite);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPendingInvites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return
    }
    const invites = await inviteService.getPendingInvitesService(userId);
    res.json(invites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { inviteId } = req.params;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return
    }
    const group = await inviteService.acceptInviteService(inviteId, userId);
    res.json(group);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const rejectInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { inviteId } = req.params;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return
    }
    await inviteService.rejectInviteService(inviteId, userId);
    res.json({ message: "Invitation rejected" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
