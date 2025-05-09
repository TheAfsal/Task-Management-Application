import GroupModel from "../models/Group.model";
import InviteModel from "../models/Invite.model";
import UserModel from "../models/User.model";
import {
  emitGroupCreated,
  emitGroupUpdated,
  emitGroupDeleted,
  emitGroupJoined,
} from "../socket";
import type { Group } from "../types/group.types";

interface CreateGroupInput {
  name: string;
  description?: string;
  leader: string;
}

interface UpdateGroupInput {
  name?: string;
  description?: string;
  leader?: string;
  userId: string;
}

export const createGroup = async ({
  name,
  description,
  leader,
}: CreateGroupInput): Promise<Group> => {
  const user = await UserModel.findById(leader);
  if (!user) {
    throw new Error("Leader not found");
  }

  const group = new GroupModel({
    name,
    description,
    leader,
    members: [leader],
  });

  await group.save();
  await group
    .populate("leader", "_id email username")
    //@ts-ignore
    .populate("members", "_id email username");
  const savedGroup = group.toObject({
    transform: (doc, ret) => {
      ret._id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  });

  emitGroupCreated(savedGroup);
  return savedGroup;
};

export const getGroups = async (userId: string): Promise<Group[]> => {
  const groups = await GroupModel.find({
    $or: [{ leader: userId }, { members: userId }],
  })
    .populate("leader", "_id email username")
    .populate("members", "_id email username");

  return groups.map((g) =>
    g.toObject({
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    })
  );
};

export const updateGroup = async (
  id: string,
  { name, description, leader, userId }: UpdateGroupInput
): Promise<Group | null> => {
  const group = await GroupModel.findById(id);
  if (!group) {
    return null;
  }

  if (group.leader !== userId) {
    throw new Error("Only the group leader can update the group");
  }

  if (leader && leader !== group.leader) {
    if (!group.members.includes(leader)) {
      throw new Error("New leader must be a group member");
    }
    const user = await UserModel.findOne({ email: leader });
    if (!user) {
      throw new Error("New leader not found");
    }
  }

  const updates: Partial<Group> = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (leader) updates.leader = leader;

  const updatedGroup = await GroupModel.findByIdAndUpdate(id, updates, {
    new: true,
  })
    .populate("leader", "_id email username")
    .populate("members", "_id email username");
  if (updatedGroup) {
    const transformedGroup = updatedGroup.toObject({
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    });
    emitGroupUpdated(transformedGroup);
    return transformedGroup;
  }
  return null;
};

export const deleteGroup = async (
  id: string,
  userId: string
): Promise<boolean> => {
  const group = await GroupModel.findById(id);
  if (!group) {
    return false;
  }

  if (group.leader !== userId) {
    throw new Error("Only the group leader can delete the group");
  }

  await GroupModel.findByIdAndDelete(id);
  await InviteModel.deleteMany({ groupId: id });
  emitGroupDeleted(id);
  return true;
};

export const joinGroup = async (
  groupId: string,
  userId: string
): Promise<Group | null> => {
  const group = await GroupModel.findById(groupId);
  if (!group) {
    return null;
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    return null;
  }

  const invite = await InviteModel.findOne({
    groupId,
    email: user.email,
    status: "pending",
  });

  if (!invite) {
    throw new Error("No valid invitation found");
  }

  if (group.members.includes(userId)) {
    throw new Error("User already in group");
  }

  group.members.push(userId);
  invite.status = "accepted";

  await group.save();
  await invite.save();
  await group
    .populate("leader", "_id email username")
  const savedGroup = group.toObject({
    transform: (doc, ret) => {
      ret._id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  });

  emitGroupJoined(savedGroup);
  return savedGroup;
};
