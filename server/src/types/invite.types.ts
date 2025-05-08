export interface Invite {
  groupId: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}
