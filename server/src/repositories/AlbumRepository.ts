import { AlbumModel, type AlbumDoc } from "../models/Album.js";
import type { AlbumQuery, IAlbumRepository } from "./interfaces.js";

/** Acesso a dados de álbuns via Mongoose (padrão Repository). */
export class AlbumRepository implements IAlbumRepository {
  findById(id: string): Promise<AlbumDoc | null> {
    return AlbumModel.findById(id).populate("artist").exec();
  }

  findByArtistAndTitle(artistId: string, title: string): Promise<AlbumDoc | null> {
    return AlbumModel.findOne({ artist: artistId, title }).exec();
  }

  findByIdWithTracks(id: string): Promise<AlbumDoc | null> {
    return AlbumModel.findById(id)
      .populate("artist")
      .populate({ path: "tracks", match: { status: "active" }, options: { sort: { playsCount: -1 } } })
      .exec();
  }

  create(data: Record<string, unknown>): Promise<AlbumDoc> {
    return AlbumModel.create(data);
  }

  update(id: string, data: Partial<Record<string, unknown>>): Promise<AlbumDoc | null> {
    return AlbumModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await AlbumModel.findByIdAndDelete(id).exec();
  }

  list(query: AlbumQuery): Promise<AlbumDoc[]> {
    const filter: Record<string, unknown> = {};
    if (query.artistId) filter.artist = query.artistId;
    return AlbumModel.find(filter)
      .populate("artist")
      .sort({ popularity: -1 })
      .limit(query.limit)
      .exec();
  }
}
