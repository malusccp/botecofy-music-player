import { Schema, model, InferSchemaType, HydratedDocument } from "mongoose";
import { ROLES } from "./enums.js";

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true, trim: true },
    role: { type: String, enum: ROLES, default: "listener", required: true },
  },
  { timestamps: true }
);

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;

export const UserModel = model("User", userSchema);
