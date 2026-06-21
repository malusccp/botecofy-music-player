import { TrackModel, type TrackDoc } from "../models/Track.js";
import type { ITrackRepository, TrackQuery } from "./interfaces.js";
import { resolveSort } from "../services/strategies/SortStrategy.js";

/** Acesso a dados de faixas via Mongoose (padrão Repository). */
export class TrackRepository implements ITrackRepository {
  findById(id: string): Promise<TrackDoc | null> {
    return TrackModel.findById(id).exec();
  }

  create(data: Record<string, unknown>): Promise<TrackDoc> {
    return TrackModel.create(data);
  }

  async deleteById(id: string): Promise<void> {
    await TrackModel.findByIdAndDelete(id).exec();
  }

  update(id: string, data: Partial<Record<string, unknown>>): Promise<TrackDoc | null> {
    return TrackModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  findActiveByArtistAndTitle(artist: string, title: string): Promise<TrackDoc | null> {
    return TrackModel.findOne({ artist, title, status: "active" }).exec();
  }

  incrementCounter(
    id: string,
    field: "playsCount" | "likesCount",
    delta: number
  ): Promise<TrackDoc | null> {
    return TrackModel.findByIdAndUpdate(id, { $inc: { [field]: delta } }, { new: true }).exec();
  }

  setStatus(id: string, status: "active" | "inactive"): Promise<TrackDoc | null> {
    return TrackModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async search(query: TrackQuery): Promise<{ items: TrackDoc[]; total: number }> {
    const filter: Record<string, unknown> = { status: query.status ?? "active" };
    if (query.rhythms && query.rhythms.length > 0) filter.rhythm = { $in: query.rhythms };
    if (query.text && query.text.trim()) filter.$text = { $search: query.text.trim() };

    const sort = resolveSort(query.sort);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      TrackModel.find(filter).sort(sort).skip(skip).limit(query.limit).exec(),
      TrackModel.countDocuments(filter).exec(),
    ]);

    return { items, total };
  }

  findTopByArtist(artistId: string, limit: number): Promise<TrackDoc[]> {
    return TrackModel.find({ artistRef: artistId, status: "active" })
      .sort({ playsCount: -1 })
      .limit(limit)
      .exec();
  }
}
