import { Types } from "mongoose";

export interface Group {
  _
  name: string;
  description?: string;
  leader: string;
  members: string[];
  createdAt?: string;
  updatedAt?: string;
}
