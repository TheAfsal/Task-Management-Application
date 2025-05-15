import { Request, Response } from "express";
import * as inviteService from "../services/invites.service";
import { STATUS_CODE } from "constants/statusCode";

export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { email, groupId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "User not authenticated" });
      return
    }

    const invite = await inviteService.sendInvite({
      email,
      groupId,
      userId,
    });

    res.status(STATUS_CODE.Created).json(invite);
  } catch (error) {
    res.status(STATUS_CODE.Internal_Server_Error).json({ error: (error as Error).message });
  }
};

export const getPendingInvites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "Unauthorized" });
      return
    }
    const invites = await inviteService.getPendingInvitesService(userId);
    res.json(invites);
  } catch (error: any) {
    res.status(STATUS_CODE.Internal_Server_Error).json({ error: error.message });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { inviteId } = req.params;
    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "Unauthorized" });
      return
    }
    const group = await inviteService.acceptInviteService(inviteId, userId);
    res.json(group);
  } catch (error: any) {
    console.log(error);
    res.status(STATUS_CODE.Bad_Request).json({ error: error.message });
  }
};

export const rejectInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { inviteId } = req.params;
    if (!userId) {
      res.status(STATUS_CODE.Unauthorized).json({ error: "Unauthorized" });
      return
    }
    await inviteService.rejectInviteService(inviteId, userId);
    res.json({ message: "Invitation rejected" });
  } catch (error: any) {
    res.status(STATUS_CODE.Bad_Request).json({ error: error.message });
  }
};
