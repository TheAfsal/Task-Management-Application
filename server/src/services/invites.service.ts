import InviteModel from "../models/Invite.model";
import GroupModel from "../models/Group.model";
import UserModel from "../models/User.model";
import type { Invite } from "../types/invite.types";

interface SendInviteInput {
  email: string;
  groupId: string;
  userId: string;
}

export const sendInvite = async ({
  email,
  groupId,
  userId,
}: SendInviteInput): Promise<Invite> => {
  const group = await GroupModel.findById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  if (group.leader !== userId) {
    throw new Error("Only the group leader can send invitations");
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (group.members.includes(email)) {
    throw new Error("User already in group");
  }

  const existingInvite = await InviteModel.findOne({ groupId, email, status: "pending" });
  if (existingInvite) {
    throw new Error("Invitation already sent");
  }

  const invite = new InviteModel({
    groupId,
    email,
    status: "pending",
  });

  await invite.save();
  return invite.toObject();
};