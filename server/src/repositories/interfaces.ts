import type { FilterQuery } from "mongoose";
import type { Rhythm } from "../models/enums.js";
import type { TrackDoc } from "../models/Track.js";
import type { PlaylistDoc } from "../models/Playlist.js";
import type { UserDoc } from "../models/User.js";
import type { LikeDoc } from "../models/Like.js";
import type { PlayHistoryDoc } from "../models/PlayHistory.js";
import type { PlaylistFollowDoc } from "../models/PlaylistFollow.js";
import type { ModerationLogDoc } from "../models/ModerationLog.js";

/**
 * Contratos de persistência (padrão Repository).
 * SOLID/ISP: interfaces pequenas e específicas por agregado, em vez de uma
 * interface "gorda". SOLID/DIP: os serviços dependem destas abstrações.
 */

export interface IReadRepository<T> {
  findById(id: string): Promise<T | null>;
}

export interface IWriteRepository<T> {
  create(data: Record<string, unknown>): Promise<T>;
  deleteById(id: string): Promise<void>;
}

export interface TrackQuery {
  rhythms?: Rhythm[];
  text?: string;
  status?: "active" | "inactive";
  sort?: string;
  page: number;
  limit: number;
}

export interface ITrackRepository extends IReadRepository<TrackDoc>, IWriteRepository<TrackDoc> {
  search(query: TrackQuery): Promise<{ items: TrackDoc[]; total: number }>;
  findActiveByArtistAndTitle(artist: string, title: string): Promise<TrackDoc | null>;
  incrementCounter(id: string, field: "playsCount" | "likesCount", delta: number): Promise<TrackDoc | null>;
  setStatus(id: string, status: "active" | "inactive"): Promise<TrackDoc | null>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<TrackDoc | null>;
}

export interface IPlaylistRepository extends IReadRepository<PlaylistDoc>, IWriteRepository<PlaylistDoc> {
  findByOwnerAndName(ownerId: string, name: string): Promise<PlaylistDoc | null>;
  listVisible(filter: FilterQuery<PlaylistDoc>): Promise<PlaylistDoc[]>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<PlaylistDoc | null>;
  findByIdPopulated(id: string): Promise<PlaylistDoc | null>;
}

export interface IUserRepository extends IReadRepository<UserDoc> {
  findByClerkId(clerkId: string): Promise<UserDoc | null>;
  create(data: Record<string, unknown>): Promise<UserDoc>;
}

export interface ILikeRepository {
  find(userId: string, trackId: string): Promise<LikeDoc | null>;
  create(userId: string, trackId: string): Promise<LikeDoc>;
  remove(userId: string, trackId: string): Promise<boolean>;
  listTrackIdsByUser(userId: string): Promise<string[]>;
}

export interface IPlayHistoryRepository {
  add(userId: string, trackId: string): Promise<PlayHistoryDoc>;
  listRecentByUser(userId: string, limit: number): Promise<PlayHistoryDoc[]>;
}

export interface IPlaylistFollowRepository {
  find(userId: string, playlistId: string): Promise<PlaylistFollowDoc | null>;
  create(userId: string, playlistId: string): Promise<PlaylistFollowDoc>;
  remove(userId: string, playlistId: string): Promise<boolean>;
  listPlaylistIdsByUser(userId: string): Promise<string[]>;
}

export interface IModerationLogRepository {
  add(data: Record<string, unknown>): Promise<ModerationLogDoc>;
  listByTrack(trackId: string): Promise<ModerationLogDoc[]>;
}
