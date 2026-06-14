import type { FilterQuery } from "mongoose";
import { PlaylistModel, type PlaylistDoc } from "../models/Playlist.js";
import type { IPlaylistRepository } from "./interfaces.js";

export class PlaylistRepository implements IPlaylistRepository {
  findById(id: string): Promise<PlaylistDoc | null> {
    return PlaylistModel.findById(id).exec();
  }

  findByIdPopulated(id: string): Promise<PlaylistDoc | null> {
    return PlaylistModel.findById(id).populate("tracks").exec();
  }

  create(data: Record<string, unknown>): Promise<PlaylistDoc> {
    return PlaylistModel.create(data);
  }

  update(id: string, data: Partial<Record<string, unknown>>): Promise<PlaylistDoc | null> {
    return PlaylistModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await PlaylistModel.findByIdAndDelete(id).exec();
  }

  findByOwnerAndName(ownerId: string, name: string): Promise<PlaylistDoc | null> {
    return PlaylistModel.findOne({ owner: ownerId, name }).exec();
  }

  listVisible(filter: FilterQuery<PlaylistDoc>): Promise<PlaylistDoc[]> {
    return PlaylistModel.find(filter).sort({ updatedAt: -1 }).exec();
  }
}
