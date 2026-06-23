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
    const status = query.status ?? "active";
    const skip = (query.page - 1) * query.limit;
    const text = query.text?.trim();

    // Busca por texto: relevância por regex (tolerante a parcial/ordem das palavras),
    // exigindo que TODAS as palavras apareçam no título ou no artista, e ordenando
    // por melhor casamento (título exato > começa com > contém > artista).
    if (text) {
      const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const phrase = esc(text);
      const words = text.split(/\s+/).filter(Boolean).map(esc);

      const match: Record<string, unknown> = { status };
      if (query.rhythms && query.rhythms.length > 0) match.rhythm = { $in: query.rhythms };
      match.$and = words.map((w) => ({
        $or: [
          { title: { $regex: w, $options: "i" } },
          { artist: { $regex: w, $options: "i" } },
        ],
      }));

      const scoreStage = {
        $addFields: {
          _score: {
            $add: [
              { $cond: [{ $regexMatch: { input: "$title", regex: `^${phrase}$`, options: "i" } }, 1000, 0] },
              { $cond: [{ $regexMatch: { input: "$title", regex: `^${phrase}`, options: "i" } }, 300, 0] },
              { $cond: [{ $regexMatch: { input: "$title", regex: phrase, options: "i" } }, 150, 0] },
              { $cond: [{ $regexMatch: { input: "$artist", regex: phrase, options: "i" } }, 40, 0] },
            ],
          },
        },
      };

      const [items, countArr] = await Promise.all([
        TrackModel.aggregate([
          { $match: match },
          scoreStage,
          { $sort: { _score: -1, playsCount: -1 } },
          { $skip: skip },
          { $limit: query.limit },
        ]).exec(),
        TrackModel.aggregate([{ $match: match }, { $count: "n" }]).exec(),
      ]);

      return { items: items as unknown as TrackDoc[], total: (countArr[0] as { n?: number })?.n ?? 0 };
    }

    // Sem texto: listagem normal (filtro por ritmo + ordenação configurável).
    const filter: Record<string, unknown> = { status };
    if (query.rhythms && query.rhythms.length > 0) filter.rhythm = { $in: query.rhythms };

    const sort = resolveSort(query.sort);
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
