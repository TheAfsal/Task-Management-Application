import { Request, Response } from "express";
import * as inviteService from "../services/invites.service";

export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { email, groupId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
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
