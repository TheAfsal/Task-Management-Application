import { Schema, model, Document } from "mongoose";
import type { Invite } from "../types/invite.types";

interface IInvite extends Invite, Document {}

const InviteSchema = new Schema<IInvite>(
  {
    groupId: { type: String, required: true },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IInvite>("Invite", InviteSchema);
