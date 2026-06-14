import { PlaylistFollowModel, type PlaylistFollowDoc } from "../models/PlaylistFollow.js";
import type { IPlaylistFollowRepository } from "./interfaces.js";

export class PlaylistFollowRepository implements IPlaylistFollowRepository {
  find(userId: string, playlistId: string): Promise<PlaylistFollowDoc | null> {
    return PlaylistFollowModel.findOne({ user: userId, playlist: playlistId }).exec();
  }

  create(userId: string, playlistId: string): Promise<PlaylistFollowDoc> {
    return PlaylistFollowModel.create({ user: userId, playlist: playlistId });
  }

  async remove(userId: string, playlistId: string): Promise<boolean> {
    const res = await PlaylistFollowModel.deleteOne({ user: userId, playlist: playlistId }).exec();
    return res.deletedCount > 0;
  }

  async listPlaylistIdsByUser(userId: string): Promise<string[]> {
    const rows = await PlaylistFollowModel.find({ user: userId }).select("playlist").exec();
    return rows.map((r) => String(r.playlist));
  }
}
