import { ModerationLogModel, type ModerationLogDoc } from "../models/ModerationLog.js";
import type { IModerationLogRepository } from "./interfaces.js";

export class ModerationLogRepository implements IModerationLogRepository {
  add(data: Record<string, unknown>): Promise<ModerationLogDoc> {
    return ModerationLogModel.create(data);
  }

  listByTrack(trackId: string): Promise<ModerationLogDoc[]> {
    return ModerationLogModel.find({ track: trackId })
      .sort({ createdAt: -1 })
      .populate("admin", "displayName")
      .exec();
  }
}
