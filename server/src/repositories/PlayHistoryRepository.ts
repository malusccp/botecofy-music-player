import { PlayHistoryModel, type PlayHistoryDoc } from "../models/PlayHistory.js";
import type { IPlayHistoryRepository } from "./interfaces.js";

export class PlayHistoryRepository implements IPlayHistoryRepository {
  add(userId: string, trackId: string): Promise<PlayHistoryDoc> {
    return PlayHistoryModel.create({ user: userId, track: trackId, playedAt: new Date() });
  }

  listRecentByUser(userId: string, limit: number): Promise<PlayHistoryDoc[]> {
    return PlayHistoryModel.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(limit)
      .populate("track")
      .exec();
  }
}
