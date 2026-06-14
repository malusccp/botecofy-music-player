import { UserModel, type UserDoc } from "../models/User.js";
import type { IUserRepository } from "./interfaces.js";

export class UserRepository implements IUserRepository {
  findById(id: string): Promise<UserDoc | null> {
    return UserModel.findById(id).exec();
  }

  findByClerkId(clerkId: string): Promise<UserDoc | null> {
    return UserModel.findOne({ clerkId }).exec();
  }

  create(data: Record<string, unknown>): Promise<UserDoc> {
    return UserModel.create(data);
  }
}
