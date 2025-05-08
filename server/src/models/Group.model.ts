import { Schema, model, Document, Types } from "mongoose";
import type { Group } from "../types/group.types";

interface IGroup extends Group, Document {
    id: Types.ObjectId; 
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    description: { type: String },
    leader: { type: String, ref: "User", required: true },
    members: [{ type: String, ref: "User", }],
  },
  { timestamps: true }
);

export default model<IGroup>("Group", GroupSchema);