import type { Group } from "./group.types";

export interface InviteFormProps {
  fetchGroups: () => void;
  groups: Group[];
  onCancel?: () => void;
}

export interface Invite {
  _id: string;
  groupId: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}
