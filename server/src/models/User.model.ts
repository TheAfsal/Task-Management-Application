import { Schema, model, Model, Document } from "mongoose";
import { IUser } from "../interfaces/auth.interface";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, required: false },
  },
  {
    versionKey: "__v",
  }
);

const UserModel: Model<IUser> = model<IUser>("User", userSchema);
export default UserModel;

// import { Schema, model, Document } from 'mongoose';

// interface IUser extends Document {
//   username: string;
//   email: string;
//   password: string;
// }

// const userSchema = new Schema<IUser>({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// export default model<IUser>('User', userSchema);
