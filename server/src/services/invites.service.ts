import InviteModel from "../models/Invite.model";
import GroupModel from "../models/Group.model";
import UserModel from "../models/User.model";
import { emitGroupJoined, emitInviteSent } from "../socket";
import type { Invite } from "../types/invite.types";
import type { Group } from "../types/group.types";

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

  if (group.leader.toString() !== userId) {
    throw new Error("Only the group leader can send invitations");
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  //@ts-ignore
  if (group.members.some((memberId) => memberId.toString() === user._id.toString())) {
    throw new Error("User already in group");
  }

  const existingInvite = await InviteModel.findOne({
    groupId,
    email,
    status: "pending",
  });
  if (existingInvite) {
    throw new Error("Invitation already sent");
  }

  const invite = new InviteModel({
    groupId,
    email,
    status: "pending",
  });

  await invite.save();
  const savedInvite = invite.toObject({
    transform: (doc, ret) => {
      ret._id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  });

  emitInviteSent(savedInvite);
  return savedInvite;
};

export const getPendingInvitesService = async (
  userId: string
): Promise<Invite[]> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const invites = await InviteModel.find({
    email: user.email,
    status: "pending",
  });

  return invites.map((invite) =>
    invite.toObject({
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    })
  );
};

export const acceptInviteService = async (
  inviteId: string,
  userId: string
): Promise<Group> => {
  const invite = await InviteModel.findById(inviteId);
  if (!invite || invite.status !== "pending") {
    throw new Error("Invalid or expired invitation");
  }

  const user = await UserModel.findById(userId);
  if (!user || invite.email !== user.email) {
    throw new Error("User not authorized to accept this invitation");
  }

  const group = await GroupModel.findById(invite.groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  if (group.members.some((memberId) => memberId.toString() === userId)) {
    throw new Error("User already in group");
  }

  group.members.push(userId);
  invite.status = "accepted";

  await group.save();
  await invite.save();

  await group.populate("leader", "_id email username");
  await group.populate("members", "_id email username");

  console.log("@@ group", group);

  // const savedGroup = group.toObject({
  //   transform: (doc, ret) => {

  //     console.log("@@ ret",ret);
      
  //     ret._id = ret._id.toString();
  //     ret.leader._id = ret.leader._id.toString();
  //     ret.members = ret.members.map((m: any) => ({
  //       ...m,
  //       _id: m._id.toString(),
  //     }));
  //     delete ret.__v;
  //     return ret;
  //   },
  // });

  emitGroupJoined(group);
  return group;
};

export const rejectInviteService = async (
  inviteId: string,
  userId: string
): Promise<void> => {
  const invite = await InviteModel.findById(inviteId);
  if (!invite || invite.status !== "pending") {
    throw new Error("Invalid or expired invitation");
  }

  const user = await UserModel.findById(userId);
  if (!user || invite.email !== user.email) {
    throw new Error("User not authorized to reject this invitation");
  }

  invite.status = "rejected";
  await invite.save();
};