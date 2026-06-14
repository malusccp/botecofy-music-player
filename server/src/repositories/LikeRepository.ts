import { LikeModel, type LikeDoc } from "../models/Like.js";
import type { ILikeRepository } from "./interfaces.js";

export class LikeRepository implements ILikeRepository {
  find(userId: string, trackId: string): Promise<LikeDoc | null> {
    return LikeModel.findOne({ user: userId, track: trackId }).exec();
  }

  create(userId: string, trackId: string): Promise<LikeDoc> {
    return LikeModel.create({ user: userId, track: trackId });
  }

  async remove(userId: string, trackId: string): Promise<boolean> {
    const res = await LikeModel.deleteOne({ user: userId, track: trackId }).exec();
    return res.deletedCount > 0;
  }

  async listTrackIdsByUser(userId: string): Promise<string[]> {
    const likes = await LikeModel.find({ user: userId }).select("track").exec();
    return likes.map((l) => String(l.track));
  }
}
